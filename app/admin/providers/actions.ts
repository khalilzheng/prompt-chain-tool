"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";


export async function createProviderAction(
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const name =
        String(
            formData.get("name") ?? ""
        ).trim();


    const description =
        String(
            formData.get("description") ?? ""
        ).trim();


    const active =
        formData.get("active") === "on";


    if (!name) {
        redirect(
            "/admin/providers/new?error=missing_name"
        );
    }


    const {
        error,
    } =
        await supabase
            .from("llm_providers")
            .insert({
                name,
                description:
                    description || null,
                active,
            });


    if (error) {
        console.error(
            "Could not create LLM provider:",
            error
        );

        redirect(
            "/admin/providers/new?error=create"
        );
    }


    revalidatePath(
        "/admin/providers"
    );


    redirect(
        "/admin/providers?created=1"
    );
}


export async function updateProviderAction(
    providerId: string,
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const name =
        String(
            formData.get("name") ?? ""
        ).trim();


    const description =
        String(
            formData.get("description") ?? ""
        ).trim();


    const active =
        formData.get("active") === "on";


    if (!name) {
        redirect(
            `/admin/providers/${providerId}/edit?error=missing_name`
        );
    }


    const {
        error,
    } =
        await supabase
            .from("llm_providers")
            .update({
                name,
                description:
                    description || null,
                active,
                updated_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                providerId
            );


    if (error) {
        console.error(
            "Could not update LLM provider:",
            error
        );

        redirect(
            `/admin/providers/${providerId}/edit?error=update`
        );
    }


    revalidatePath(
        "/admin/providers"
    );


    redirect(
        "/admin/providers?updated=1"
    );
}


export async function deleteProviderAction(
    providerId: string,
    _formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        error,
    } =
        await supabase
            .from("llm_providers")
            .delete()
            .eq(
                "id",
                providerId
            );


    if (error) {
        console.error(
            "Could not delete LLM provider:",
            error
        );

        if (
            error.code === "23503"
        ) {
            redirect(
                "/admin/providers?error=in_use"
            );
        }

        redirect(
            "/admin/providers?error=delete"
        );
    }


    revalidatePath(
        "/admin/providers"
    );


    redirect(
        "/admin/providers?deleted=1"
    );
}