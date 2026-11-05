import {
    NextResponse,
} from "next/server";

import {
    GoogleGenAI,
} from "@google/genai";

import {
    createClient,
} from "@/utils/supabase/server";


export const runtime =
    "nodejs";


type RequestBody = {
    promptChainId?: unknown;
    imageId?: unknown;
};


type PromptChainStep = {
    id: string;
    step_order: number;
    name: string;
    prompt_template: string;
};


const ALLOWED_MIME_TYPES =
    new Set([
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
    ]);


const MODEL_CHAIN = [
    {
        name:
            "gemini-3.8-flash",

        attempts:
            1,
    },

    {
        name:
            "gemini-3.5-flash-lite",

        attempts:
            2,
    },
] as const;


function cleanString(
    value: unknown
): string
{
    if (
        typeof value !==
        "string"
    )
    {
        return "";
    }


    return value.trim();
}


function normalizeMimeType(
    value: string
): string
{
    return value
        .split(";")[0]
        .trim()
        .toLowerCase();
}


function inferMimeTypeFromUrl(
    imageUrl: string
): string | null
{
    const cleanUrl =
        imageUrl
            .split("?")[0]
            .toLowerCase();


    if (
        cleanUrl.endsWith(
            ".png"
        )
    )
    {
        return "image/png";
    }


    if (
        cleanUrl.endsWith(
            ".jpg"
        ) ||
        cleanUrl.endsWith(
            ".jpeg"
        )
    )
    {
        return "image/jpeg";
    }


    if (
        cleanUrl.endsWith(
            ".webp"
        )
    )
    {
        return "image/webp";
    }


    if (
        cleanUrl.endsWith(
            ".gif"
        )
    )
    {
        return "image/gif";
    }


    return null;
}


function isRetryableError(
    error: unknown
): boolean
{
    const message =
        error instanceof Error
            ? error.message
            : String(
                error
            );


    const upperMessage =
        message.toUpperCase();


    return (
        upperMessage.includes(
            "503"
        ) ||
        upperMessage.includes(
            "429"
        ) ||
        upperMessage.includes(
            "UNAVAILABLE"
        ) ||
        upperMessage.includes(
            "RESOURCE_EXHAUSTED"
        ) ||
        upperMessage.includes(
            "OVERLOADED"
        )
    );
}


function sleep(
    milliseconds: number
)
{
    return new Promise<void>(
        (
            resolve
        ) =>
        {
            setTimeout(
                resolve,
                milliseconds
            );
        }
    );
}


function cleanOutput(
    value: string
): string
{
    let output =
        value.trim();


    if (
        output.startsWith(
            "```"
        )
    )
    {
        output =
            output
                .replace(
                    /^```(?:text)?/i,
                    ""
                )
                .replace(
                    /```$/,
                    ""
                )
                .trim();
    }


    return output;
}


async function downloadImage(
    imageUrl: string
): Promise<{
    base64: string;
    mimeType: string;
}>
{
    const response =
        await fetch(
            imageUrl,
            {
                cache:
                    "no-store",
            }
        );


    if (
        !response.ok
    )
    {
        throw new Error(
            `Could not load image (${response.status}).`
        );
    }


    const responseMimeType =
        normalizeMimeType(
            response.headers.get(
                "content-type"
            ) ??
            ""
        );


    const inferredMimeType =
        inferMimeTypeFromUrl(
            imageUrl
        );


    const mimeType =
        ALLOWED_MIME_TYPES.has(
            responseMimeType
        )
            ? responseMimeType
            : inferredMimeType &&
            ALLOWED_MIME_TYPES.has(
                inferredMimeType
            )
                ? inferredMimeType
                : "";


    if (
        !mimeType
    )
    {
        throw new Error(
            "Unsupported image type."
        );
    }


    const arrayBuffer =
        await response.arrayBuffer();


    const maxBytes =
        12 *
        1024 *
        1024;


    if (
        arrayBuffer.byteLength ===
        0
    )
    {
        throw new Error(
            "The image is empty."
        );
    }


    if (
        arrayBuffer.byteLength >
        maxBytes
    )
    {
        throw new Error(
            "Image is too large."
        );
    }


    return {
        base64:
            Buffer.from(
                arrayBuffer
            ).toString(
                "base64"
            ),

        mimeType,
    };
}


async function callModelWithImage(
    ai: GoogleGenAI,
    modelName: string,
    imageBase64: string,
    mimeType: string,
    prompt: string
): Promise<string>
{
    const response =
        await ai.models.generateContent(
            {
                model:
                modelName,

                contents: [
                    {
                        role:
                            "user",

                        parts: [
                            {
                                inlineData: {
                                    mimeType,

                                    data:
                                    imageBase64,
                                },
                            },

                            {
                                text:
                                prompt,
                            },
                        ],
                    },
                ],
            }
        );


    const output =
        cleanOutput(
            response.text ??
            ""
        );


    if (
        !output
    )
    {
        throw new Error(
            `${modelName} returned an empty result.`
        );
    }


    return output;
}


async function callModelWithText(
    ai: GoogleGenAI,
    modelName: string,
    prompt: string
): Promise<string>
{
    const response =
        await ai.models.generateContent(
            {
                model:
                modelName,

                contents: [
                    {
                        role:
                            "user",

                        parts: [
                            {
                                text:
                                prompt,
                            },
                        ],
                    },
                ],
            }
        );


    const output =
        cleanOutput(
            response.text ??
            ""
        );


    if (
        !output
    )
    {
        throw new Error(
            `${modelName} returned an empty result.`
        );
    }


    return output;
}


async function runWithFallback(
    ai: GoogleGenAI,
    prompt: string,
    imageBase64?: string,
    mimeType?: string
): Promise<{
    output: string;
    model: string;
}>
{
    let lastError:
        unknown =
        null;


    for (
        const modelConfig
        of MODEL_CHAIN
        )
    {
        for (
            let attempt = 1;
            attempt <=
            modelConfig.attempts;
            attempt++
        )
        {
            try
            {
                const output =
                    imageBase64 &&
                    mimeType
                        ? await callModelWithImage(
                            ai,
                            modelConfig.name,
                            imageBase64,
                            mimeType,
                            prompt
                        )
                        : await callModelWithText(
                            ai,
                            modelConfig.name,
                            prompt
                        );


                return {
                    output,

                    model:
                    modelConfig.name,
                };
            }
            catch (
                error
                )
            {
                lastError =
                    error;


                console.warn(
                    `Model ${modelConfig.name} attempt ${attempt} failed:`,
                    error
                );


                if (
                    !isRetryableError(
                        error
                    )
                )
                {
                    break;
                }


                if (
                    attempt <
                    modelConfig.attempts
                )
                {
                    await sleep(
                        650
                    );
                }
            }
        }
    }


    throw (
        lastError ??
        new Error(
            "No AI model was available."
        )
    );
}


export async function POST(
    request: Request
)
{
    try
    {
        const apiKey =
            process.env
                .GEMINI_API_KEY;


        if (
            !apiKey
        )
        {
            return NextResponse.json(
                {
                    error:
                        "GEMINI_API_KEY is not configured.",
                },
                {
                    status:
                        500,
                }
            );
        }


        const supabase =
            await createClient();


        const {
            data: {
                user,
            },

            error:
                userError,
        } =
            await supabase.auth.getUser();


        if (
            userError ||
            !user
        )
        {
            return NextResponse.json(
                {
                    error:
                        "You must be logged in.",
                },
                {
                    status:
                        401,
                }
            );
        }


        const {
            data:
                profile,

            error:
                profileError,
        } =
            await supabase
                .from(
                    "profiles"
                )
                .select(
                    "is_superadmin"
                )
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();


        if (
            profileError ||
            !profile ||
            profile.is_superadmin !==
            true
        )
        {
            return NextResponse.json(
                {
                    error:
                        "Superadmin access is required.",
                },
                {
                    status:
                        403,
                }
            );
        }


        const body =
            (
                await request.json()
            ) as RequestBody;


        const promptChainId =
            cleanString(
                body.promptChainId
            );


        const imageId =
            cleanString(
                body.imageId
            );


        if (
            !promptChainId ||
            !imageId
        )
        {
            return NextResponse.json(
                {
                    error:
                        "Prompt chain and image are required.",
                },
                {
                    status:
                        400,
                }
            );
        }


        const {
            data:
                promptChain,

            error:
                promptChainError,
        } =
            await supabase
                .from(
                    "prompt_chains"
                )
                .select(
                    `
                    id,
                    name,
                    description
                    `
                )
                .eq(
                    "id",
                    promptChainId
                )
                .maybeSingle();


        if (
            promptChainError ||
            !promptChain
        )
        {
            return NextResponse.json(
                {
                    error:
                        "Prompt chain was not found.",
                },
                {
                    status:
                        404,
                }
            );
        }


        const {
            data:
                stepRows,

            error:
                stepsError,
        } =
            await supabase
                .from(
                    "prompt_chain_steps"
                )
                .select(
                    `
                    id,
                    step_order,
                    name,
                    prompt_template
                    `
                )
                .eq(
                    "prompt_chain_id",
                    promptChainId
                )
                .order(
                    "step_order",
                    {
                        ascending:
                            true,
                    }
                );


        if (
            stepsError
        )
        {
            console.error(
                "Could not load prompt chain steps:",
                stepsError
            );


            return NextResponse.json(
                {
                    error:
                        "Could not load prompt chain steps.",
                },
                {
                    status:
                        500,
                }
            );
        }


        const steps =
            (
                stepRows ??
                []
            ) as PromptChainStep[];


        if (
            steps.length ===
            0
        )
        {
            return NextResponse.json(
                {
                    error:
                        "This prompt chain has no steps.",
                },
                {
                    status:
                        400,
                }
            );
        }


        const {
            data:
                imageRow,

            error:
                imageError,
        } =
            await supabase
                .from(
                    "images"
                )
                .select(
                    `
                    id,
                    image_url,
                    alt_text
                    `
                )
                .eq(
                    "id",
                    imageId
                )
                .maybeSingle();


        if (
            imageError ||
            !imageRow
        )
        {
            return NextResponse.json(
                {
                    error:
                        "Image was not found.",
                },
                {
                    status:
                        404,
                }
            );
        }


        const {
            base64,
            mimeType,
        } =
            await downloadImage(
                imageRow.image_url
            );


        const ai =
            new GoogleGenAI({
                apiKey,
            });


        const stepResults:
            Array<{
                stepId: string;
                stepOrder: number;
                stepName: string;
                output: string;
                model: string;
            }> =
            [];


        let previousOutput =
            "";


        for (
            let currentIndex = 0;
            currentIndex <
            steps.length;
            currentIndex++
        )
        {
            const currentStep =
                steps[
                    currentIndex
                    ];


            let finalPrompt =
                "";


            if (
                currentIndex ===
                0
            )
            {
                finalPrompt =
                    `
You are executing step ${currentStep.step_order} of a prompt chain named "${promptChain.name}".

Step instruction:
${currentStep.prompt_template}

Look carefully at the supplied image.

Return only the output for this step.
Do not explain your reasoning.
`.trim();
            }
            else
            {
                finalPrompt =
                    `
You are executing step ${currentStep.step_order} of a prompt chain named "${promptChain.name}".

Step instruction:
${currentStep.prompt_template}

Previous step output:
${previousOutput}

Use the previous step output as the input for this step.

Return only the output for this step.
Do not explain your reasoning.
`.trim();
            }


            const result =
                await runWithFallback(
                    ai,
                    finalPrompt,
                    currentIndex ===
                    0
                        ? base64
                        : undefined,
                    currentIndex ===
                    0
                        ? mimeType
                        : undefined
                );


            previousOutput =
                result.output;


            stepResults.push({
                stepId:
                currentStep.id,

                stepOrder:
                currentStep.step_order,

                stepName:
                currentStep.name,

                output:
                result.output,

                model:
                result.model,
            });
        }


        const finalOutput =
            previousOutput;


        const storedPrompt =
            steps
                .map(
                    (
                        step
                    ) =>
                        `Step ${step.step_order}: ${step.prompt_template}`
                )
                .join(
                    "\n\n"
                );


        const {
            data:
                generation,

            error:
                generationError,
        } =
            await supabase
                .from(
                    "generations"
                )
                .insert({
                    user_id:
                    user.id,

                    image_url:
                    imageRow.image_url,

                    prompt:
                    storedPrompt,

                    caption:
                    finalOutput,

                    prompt_chain_id:
                    promptChainId,
                })
                .select(
                    "id"
                )
                .single();


        if (
            generationError
        )
        {
            console.error(
                "Could not save prompt chain generation:",
                generationError
            );


            return NextResponse.json(
                {
                    error:
                        "The chain ran, but the result could not be saved.",
                },
                {
                    status:
                        500,
                }
            );
        }


        return NextResponse.json(
            {
                generationId:
                generation.id,

                promptChainId:
                promptChainId,

                promptChainName:
                promptChain.name,

                imageUrl:
                imageRow.image_url,

                finalOutput,

                steps:
                stepResults,
            }
        );
    }
    catch (
        error
        )
    {
        console.error(
            "Run prompt chain error:",
            error
        );


        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Could not run the prompt chain.",
            },
            {
                status:
                    500,
            }
        );
    }
}