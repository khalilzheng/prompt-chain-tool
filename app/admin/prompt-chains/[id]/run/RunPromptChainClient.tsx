"use client";

/* eslint-disable @next/next/no-img-element */

import {
    useState,
} from "react";


type PromptChainStep = {
    id: string;
    step_order: number;
    name: string;
    prompt_template: string;
};


type ImageRow = {
    id: string;
    image_url: string;
    alt_text: string | null;
    created_at: string;
};


type Generation = {
    id: string;
    created_at: string;
    image_url: string | null;
    prompt: string | null;
    caption: string | null;
    prompt_chain_id: string | null;
};


type StepResult = {
    stepId: string;
    stepOrder: number;
    stepName: string;
    output: string;
    model: string;
};


type RunResult = {
    generationId: string;
    promptChainId: string;
    promptChainName: string;
    imageUrl: string;
    finalOutput: string;
    steps: StepResult[];
};


type RunPromptChainClientProps = {
    promptChainId: string;
    promptChainName: string;
    steps: PromptChainStep[];
    images: ImageRow[];
    initialGenerations: Generation[];
};


export default function RunPromptChainClient({
                                                 promptChainId,
                                                 promptChainName,
                                                 steps,
                                                 images,
                                                 initialGenerations,
                                             }: RunPromptChainClientProps)
{
    const [
        selectedImageId,
        setSelectedImageId,
    ] =
        useState(
            images[0]?.id ??
            ""
        );


    const [
        running,
        setRunning,
    ] =
        useState(
            false
        );


    const [
        error,
        setError,
    ] =
        useState(
            ""
        );


    const [
        result,
        setResult,
    ] =
        useState<
            RunResult |
            null
        >(
            null
        );


    const [
        generations,
        setGenerations,
    ] =
        useState<
            Generation[]
        >(
            initialGenerations
        );


    async function runPromptChain()
    {
        if (
            !selectedImageId
        )
        {
            setError(
                "Select an image first."
            );

            return;
        }


        if (
            steps.length ===
            0
        )
        {
            setError(
                "This prompt chain has no steps."
            );

            return;
        }


        setRunning(
            true
        );


        setError(
            ""
        );


        setResult(
            null
        );


        try
        {
            const response =
                await fetch(
                    "/api/run-prompt-chain",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                {
                                    promptChainId,

                                    imageId:
                                    selectedImageId,
                                }
                            ),
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok
            )
            {
                throw new Error(
                    data.error ??
                    "Could not run the prompt chain."
                );
            }


            const runResult =
                data as RunResult;


            setResult(
                runResult
            );


            setGenerations(
                (
                    currentGenerations
                ) => [
                    {
                        id:
                        runResult.generationId,

                        created_at:
                            new Date()
                                .toISOString(),

                        image_url:
                        runResult.imageUrl,

                        prompt:
                            `Prompt chain: ${promptChainName}`,

                        caption:
                        runResult.finalOutput,

                        prompt_chain_id:
                        promptChainId,
                    },

                    ...currentGenerations,
                ]
            );
        }
        catch (
            runError
            )
        {
            setError(
                runError instanceof Error
                    ? runError.message
                    : "Could not run the prompt chain."
            );
        }
        finally
        {
            setRunning(
                false
            );
        }
    }


    return (
        <div className="mt-8 space-y-8">

            {/* CHAIN STEPS */}

            <section className="rounded-3xl border border-zinc-200 bg-white p-7">

                <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                    CHAIN STEPS
                </p>


                <div className="mt-5 space-y-3">

                    {steps.map(
                        (
                            step
                        ) => (
                            <div
                                key={
                                    step.id
                                }
                                className="flex gap-4 rounded-2xl bg-zinc-50 p-5"
                            >

                                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black text-sm font-semibold text-white">
                                    {
                                        step.step_order
                                    }
                                </div>


                                <div>

                                    <p className="font-semibold">
                                        {
                                            step.name
                                        }
                                    </p>


                                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                                        {
                                            step.prompt_template
                                        }
                                    </p>

                                </div>

                            </div>
                        )
                    )}

                </div>

            </section>


            {/* SELECT IMAGE */}

            <section className="rounded-3xl border border-zinc-200 bg-white p-7">

                <div className="flex items-center justify-between gap-4">

                    <div>

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            INPUT IMAGE
                        </p>


                        <h2 className="mt-2 text-xl font-semibold">
                            Choose an image
                        </h2>

                    </div>


                    <button
                        type="button"
                        onClick={
                            runPromptChain
                        }
                        disabled={
                            running ||
                            !selectedImageId ||
                            steps.length ===
                            0
                        }
                        className="h-11 rounded-full bg-black px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {
                            running
                                ? "Running..."
                                : "Run Prompt Chain"
                        }
                    </button>

                </div>


                {error && (
                    <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                        {
                            error
                        }
                    </div>
                )}


                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    {images.map(
                        (
                            image
                        ) =>
                        {
                            const selected =
                                selectedImageId ===
                                image.id;


                            return (
                                <button
                                    key={
                                        image.id
                                    }
                                    type="button"
                                    onClick={
                                        () =>
                                        {
                                            setSelectedImageId(
                                                image.id
                                            );
                                        }
                                    }
                                    className={
                                        selected
                                            ? "overflow-hidden rounded-2xl border-2 border-black bg-white text-left"
                                            : "overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left"
                                    }
                                >

                                    <img
                                        src={
                                            image.image_url
                                        }
                                        alt={
                                            image.alt_text ??
                                            "Prompt chain input"
                                        }
                                        className="aspect-square w-full object-cover"
                                    />


                                    <div className="p-3">

                                        <p className="truncate text-xs text-zinc-500">
                                            {
                                                image.alt_text ||
                                                "No alt text"
                                            }
                                        </p>

                                    </div>

                                </button>
                            );
                        }
                    )}

                </div>

            </section>


            {/* LATEST RUN */}

            {result && (
                <section className="rounded-3xl border border-zinc-200 bg-white p-7">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        LATEST RUN
                    </p>


                    <div className="mt-6 grid gap-7 lg:grid-cols-[320px_1fr]">

                        <img
                            src={
                                result.imageUrl
                            }
                            alt="Generated result source"
                            className="w-full rounded-2xl object-cover"
                        />


                        <div>

                            <h2 className="text-2xl font-semibold">
                                Final Output
                            </h2>


                            <p className="mt-3 whitespace-pre-wrap text-lg leading-8 text-zinc-700">
                                {
                                    result.finalOutput
                                }
                            </p>


                            <div className="mt-8 space-y-4">

                                {result.steps.map(
                                    (
                                        step
                                    ) => (
                                        <div
                                            key={
                                                step.stepId
                                            }
                                            className="rounded-2xl bg-zinc-50 p-5"
                                        >

                                            <p className="text-sm font-semibold">
                                                Step {
                                                step.stepOrder
                                            }: {
                                                step.stepName
                                            }
                                            </p>


                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                                                {
                                                    step.output
                                                }
                                            </p>


                                            <p className="mt-3 text-xs text-zinc-400">
                                                {
                                                    step.model
                                                }
                                            </p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </section>
            )}


            {/* GENERATED MEDIA */}

            <section className="rounded-3xl border border-zinc-200 bg-white p-7">

                <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                    GENERATED MEDIA
                </p>


                <h2 className="mt-2 text-xl font-semibold">
                    Results from this prompt chain
                </h2>


                {generations.length >
                0 ? (
                    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {generations.map(
                            (
                                generation
                            ) => (
                                <article
                                    key={
                                        generation.id
                                    }
                                    className="overflow-hidden rounded-2xl border border-zinc-200"
                                >

                                    {generation.image_url && (
                                        <img
                                            src={
                                                generation.image_url
                                            }
                                            alt="Generated media source"
                                            className="aspect-video w-full object-cover"
                                        />
                                    )}


                                    <div className="p-5">

                                        <p className="whitespace-pre-wrap font-semibold leading-6">
                                            {
                                                generation.caption
                                            }
                                        </p>


                                        <p className="mt-4 text-xs text-zinc-400">
                                            {
                                                new Date(
                                                    generation.created_at
                                                ).toLocaleString()
                                            }
                                        </p>

                                    </div>

                                </article>
                            )
                        )}

                    </div>
                ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 py-12 text-center">

                        <p className="font-semibold">
                            No generated media yet.
                        </p>


                        <p className="mt-2 text-sm text-zinc-400">
                            Run this prompt chain to create the first result.
                        </p>

                    </div>
                )}

            </section>

        </div>
    );
}