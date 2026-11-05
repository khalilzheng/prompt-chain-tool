"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";


export async function createModelAction(
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const providerId =
        String(
            formData.get("provider_id") ?? ""
        ).trim();


    const name =
        String(
            formData.get("name") ?? ""
        ).trim();


    const modelKey =
        String(
            formData.get("model_key") ?? ""
        ).trim();


    const active =
        formData.get("active") === "on";


    if (
        !providerId ||
        !name ||
        !modelKey
    ) {
        redirect(
            "/admin/models/new?error=missing_fields"
        );
    }


    const {
        error,
    } =
        await supabase
            .from("llm_models")
            .insert({
                provider_id: providerId,
                name,
                model_key: modelKey,
                active,
            });


    if (error) {
        console.error(
            "Could not create LLM model:",
            error
        );

        redirect(
            "/admin/models/new?error=create"
        );
    }


    revalidatePath(
        "/admin/models"
    );


    redirect(
        "/admin/models?created=1"
    );
}


export async function updateModelAction(
    modelId: string,
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const providerId =
        String(
            formData.get("provider_id") ?? ""
        ).trim();


    const name =
        String(
            formData.get("name") ?? ""
        ).trim();


    const modelKey =
        String(
            formData.get("model_key") ?? ""
        ).trim();


    const active =
        formData.get("active") === "on";


    if (
        !providerId ||
        !name ||
        !modelKey
    ) {
        redirect(
            `/admin/models/${modelId}/edit?error=missing_fields`
        );
    }


    const {
        error,
    } =
        await supabase
            .from("llm_models")
            .update({
                provider_id: providerId,
                name,
                model_key: modelKey,
                active,
                updated_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                modelId
            );


    if (error) {
        console.error(
            "Could not update LLM model:",
            error
        );

        redirect(
            `/admin/models/${modelId}/edit?error=update`
        );
    }


    revalidatePath(
        "/admin/models"
    );


    redirect(
        "/admin/models?updated=1"
    );
}


export async function deleteModelAction(
    modelId: string,
    _formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        error,
    } =
        await supabase
            .from("llm_models")
            .delete()
            .eq(
                "id",
                modelId
            );


    if (error) {
        console.error(
            "Could not delete LLM model:",
            error
        );


        if (
            error.code === "23503"
        ) {
            redirect(
                "/admin/models?error=in_use"
            );
        }


        redirect(
            "/admin/models?error=delete"
        );
    }


    revalidatePath(
        "/admin/models"
    );


    redirect(
        "/admin/models?deleted=1"
    );
}