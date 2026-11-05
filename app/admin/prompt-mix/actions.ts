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


export async function updatePromptMixAction(
    mixId: string,
    formData: FormData
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const weightValue =
        formData.get(
            "weight"
        );


    const enabledValue =
        formData.get(
            "enabled"
        );


    const weight =
        Number(
            weightValue
        );


    const enabled =
        enabledValue ===
        "on";


    if (
        Number.isNaN(
            weight
        ) ||
        weight <
        0 ||
        weight >
        1
    ) {
        redirect(
            "/admin/prompt-mix?error=invalid_weight"
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "prompt_chain_mix"
            )
            .update({
                weight,
                enabled,
                updated_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                mixId
            );


    if (
        error
    ) {
        console.error(
            "Could not update prompt mix:",
            error
        );

        redirect(
            "/admin/prompt-mix?error=update"
        );
    }


    revalidatePath(
        "/admin/prompt-mix"
    );

    revalidatePath(
        "/admin"
    );


    redirect(
        "/admin/prompt-mix?updated=1"
    );
}