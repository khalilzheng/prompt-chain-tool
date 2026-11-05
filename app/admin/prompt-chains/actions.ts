"use server";

import {
    revalidatePath,
} from "next/cache";

import {
    redirect,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";


async function normalizeStepOrder(
    promptChainId: string
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const {
        data,
        error,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .select(
                `
                id,
                step_order
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
            )
            .order(
                "id",
                {
                    ascending:
                        true,
                }
            );


    if (
        error
    )
    {
        console.error(
            "Could not normalize step order:",
            error
        );

        return;
    }


    const steps =
        data ??
        [];


    /*
     * Move every step temporarily to a high number first.
     * This avoids possible conflicts if step_order is unique.
     */
    for (
        let currentIndex = 0;
        currentIndex < steps.length;
        currentIndex++
    )
    {
        const currentStep =
            steps[currentIndex];


        await supabase
            .from(
                "prompt_chain_steps"
            )
            .update({
                step_order:
                    10000 +
                    currentIndex,
            })
            .eq(
                "id",
                currentStep.id
            );
    }


    /*
     * Put them back into clean order:
     * 1, 2, 3, ...
     */
    for (
        let currentIndex = 0;
        currentIndex < steps.length;
        currentIndex++
    )
    {
        const currentStep =
            steps[currentIndex];


        await supabase
            .from(
                "prompt_chain_steps"
            )
            .update({
                step_order:
                    currentIndex +
                    1,
            })
            .eq(
                "id",
                currentStep.id
            );
    }
}


export async function createPromptChainAction(
    formData: FormData
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const name =
        String(
            formData.get(
                "name"
            ) ??
            ""
        ).trim();


    const description =
        String(
            formData.get(
                "description"
            ) ??
            ""
        ).trim();


    if (
        name.length ===
        0
    )
    {
        redirect(
            "/admin/prompt-chains/new?error=missing_name"
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "prompt_chains"
            )
            .insert({
                name:
                name,

                description:
                    description.length >
                    0
                        ? description
                        : null,
            });


    if (
        error
    )
    {
        console.error(
            "Could not create prompt chain:",
            error
        );


        redirect(
            "/admin/prompt-chains/new?error=create"
        );
    }


    revalidatePath(
        "/admin/prompt-chains"
    );


    redirect(
        "/admin/prompt-chains?created=1"
    );
}


export async function updatePromptChainAction(
    promptChainId: string,
    formData: FormData
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const name =
        String(
            formData.get(
                "name"
            ) ??
            ""
        ).trim();


    const description =
        String(
            formData.get(
                "description"
            ) ??
            ""
        ).trim();


    if (
        name.length ===
        0
    )
    {
        redirect(
            `/admin/prompt-chains/${promptChainId}/edit?error=missing_name`
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "prompt_chains"
            )
            .update({
                name:
                name,

                description:
                    description.length >
                    0
                        ? description
                        : null,
            })
            .eq(
                "id",
                promptChainId
            );


    if (
        error
    )
    {
        console.error(
            "Could not update prompt chain:",
            error
        );


        redirect(
            `/admin/prompt-chains/${promptChainId}/edit?error=update`
        );
    }


    revalidatePath(
        "/admin/prompt-chains"
    );


    redirect(
        "/admin/prompt-chains?updated=1"
    );
}


export async function deletePromptChainAction(
    promptChainId: string,
    _formData: FormData
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    await supabase
        .from(
            "prompt_chain_mix"
        )
        .delete()
        .eq(
            "prompt_chain_id",
            promptChainId
        );


    const {
        error:
            stepDeleteError,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .delete()
            .eq(
                "prompt_chain_id",
                promptChainId
            );


    if (
        stepDeleteError
    )
    {
        console.error(
            "Could not delete prompt chain steps:",
            stepDeleteError
        );


        redirect(
            "/admin/prompt-chains?error=delete"
        );
    }


    const {
        error:
            chainDeleteError,
    } =
        await supabase
            .from(
                "prompt_chains"
            )
            .delete()
            .eq(
                "id",
                promptChainId
            );


    if (
        chainDeleteError
    )
    {
        console.error(
            "Could not delete prompt chain:",
            chainDeleteError
        );


        redirect(
            "/admin/prompt-chains?error=delete"
        );
    }


    revalidatePath(
        "/admin/prompt-chains"
    );


    redirect(
        "/admin/prompt-chains?deleted=1"
    );
}


export async function createPromptChainStepAction(
    promptChainId: string,
    formData: FormData
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const name =
        String(
            formData.get(
                "name"
            ) ??
            ""
        ).trim();


    const promptTemplate =
        String(
            formData.get(
                "prompt_template"
            ) ??
            ""
        ).trim();


    if (
        name.length ===
        0 ||
        promptTemplate.length ===
        0
    )
    {
        redirect(
            `/admin/prompt-chains/${promptChainId}/steps/new?error=missing_fields`
        );
    }


    const {
        data:
            existingSteps,
        error:
            existingStepsError,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .select(
                "step_order"
            )
            .eq(
                "prompt_chain_id",
                promptChainId
            )
            .order(
                "step_order",
                {
                    ascending:
                        false,
                }
            )
            .limit(
                1
            );


    if (
        existingStepsError
    )
    {
        console.error(
            "Could not determine next step order:",
            existingStepsError
        );


        redirect(
            `/admin/prompt-chains/${promptChainId}/steps/new?error=create`
        );
    }


    const nextStepOrder =
        existingSteps &&
        existingSteps.length >
        0
            ? existingSteps[0].step_order +
            1
            : 1;


    const {
        error,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .insert({
                prompt_chain_id:
                promptChainId,

                step_order:
                nextStepOrder,

                name:
                name,

                prompt_template:
                promptTemplate,
            });


    if (
        error
    )
    {
        console.error(
            "Could not create prompt chain step:",
            error
        );


        redirect(
            `/admin/prompt-chains/${promptChainId}/steps/new?error=create`
        );
    }


    revalidatePath(
        `/admin/prompt-chains/${promptChainId}`
    );


    revalidatePath(
        "/admin/prompt-chains"
    );


    redirect(
        `/admin/prompt-chains/${promptChainId}?created=1`
    );
}


export async function updatePromptChainStepAction(
    promptChainId: string,
    stepId: string,
    formData: FormData
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const name =
        String(
            formData.get(
                "name"
            ) ??
            ""
        ).trim();


    const promptTemplate =
        String(
            formData.get(
                "prompt_template"
            ) ??
            ""
        ).trim();


    if (
        name.length ===
        0 ||
        promptTemplate.length ===
        0
    )
    {
        redirect(
            `/admin/prompt-chains/${promptChainId}/steps/${stepId}/edit?error=missing_fields`
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .update({
                name:
                name,

                prompt_template:
                promptTemplate,
            })
            .eq(
                "id",
                stepId
            )
            .eq(
                "prompt_chain_id",
                promptChainId
            );


    if (
        error
    )
    {
        console.error(
            "Could not update prompt chain step:",
            error
        );


        redirect(
            `/admin/prompt-chains/${promptChainId}/steps/${stepId}/edit?error=update`
        );
    }


    revalidatePath(
        `/admin/prompt-chains/${promptChainId}`
    );


    revalidatePath(
        "/admin/prompt-chains"
    );


    redirect(
        `/admin/prompt-chains/${promptChainId}?updated=1`
    );
}


export async function deletePromptChainStepAction(
    promptChainId: string,
    stepId: string,
    _formData: FormData
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const {
        error,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .delete()
            .eq(
                "id",
                stepId
            )
            .eq(
                "prompt_chain_id",
                promptChainId
            );


    if (
        error
    )
    {
        console.error(
            "Could not delete prompt chain step:",
            error
        );


        redirect(
            `/admin/prompt-chains/${promptChainId}?error=delete`
        );
    }


    await normalizeStepOrder(
        promptChainId
    );


    revalidatePath(
        `/admin/prompt-chains/${promptChainId}`
    );


    revalidatePath(
        "/admin/prompt-chains"
    );


    redirect(
        `/admin/prompt-chains/${promptChainId}?deleted=1`
    );
}


export async function movePromptChainStepAction(
    promptChainId: string,
    stepId: string,
    direction: string,
    _formData: FormData
)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const {
        data,
        error,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .select(
                `
                id,
                step_order
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
            )
            .order(
                "id",
                {
                    ascending:
                        true,
                }
            );


    if (
        error
    )
    {
        console.error(
            "Could not load steps for reorder:",
            error
        );


        redirect(
            `/admin/prompt-chains/${promptChainId}?error=reorder`
        );
    }


    const steps =
        data ??
        [];


    const currentIndex =
        steps.findIndex(
            (
                step
            ) =>
                step.id ===
                stepId
        );


    if (
        currentIndex ===
        -1
    )
    {
        redirect(
            `/admin/prompt-chains/${promptChainId}`
        );
    }


    let targetIndex =
        currentIndex;


    if (
        direction ===
        "up"
    )
    {
        targetIndex =
            currentIndex -
            1;
    }


    if (
        direction ===
        "down"
    )
    {
        targetIndex =
            currentIndex +
            1;
    }


    if (
        targetIndex <
        0 ||
        targetIndex >=
        steps.length
    )
    {
        redirect(
            `/admin/prompt-chains/${promptChainId}`
        );
    }


    const reorderedSteps =
        [
            ...steps,
        ];


    const currentStep =
        reorderedSteps[
            currentIndex
            ];


    reorderedSteps[
        currentIndex
        ] =
        reorderedSteps[
            targetIndex
            ];


    reorderedSteps[
        targetIndex
        ] =
        currentStep;


    /*
     * Temporarily move all orders to high numbers
     * so there are no ordering conflicts.
     */
    for (
        let currentStepIndex = 0;
        currentStepIndex <
        reorderedSteps.length;
        currentStepIndex++
    )
    {
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .update({
                step_order:
                    10000 +
                    currentStepIndex,
            })
            .eq(
                "id",
                reorderedSteps[
                    currentStepIndex
                    ].id
            );
    }


    /*
     * Store the final order.
     */
    for (
        let currentStepIndex = 0;
        currentStepIndex <
        reorderedSteps.length;
        currentStepIndex++
    )
    {
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .update({
                step_order:
                    currentStepIndex +
                    1,
            })
            .eq(
                "id",
                reorderedSteps[
                    currentStepIndex
                    ].id
            );
    }


    revalidatePath(
        `/admin/prompt-chains/${promptChainId}`
    );


    revalidatePath(
        "/admin/prompt-chains"
    );


    redirect(
        `/admin/prompt-chains/${promptChainId}?reordered=1`
    );
}