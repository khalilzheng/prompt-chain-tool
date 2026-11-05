"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";


export async function createTermAction(
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const term =
        String(
            formData.get("term") ?? ""
        ).trim();


    const description =
        String(
            formData.get("description") ?? ""
        ).trim();


    const active =
        formData.get("active") === "on";


    if (!term) {
        redirect(
            "/admin/terms/new?error=missing_term"
        );
    }


    const {
        error,
    } =
        await supabase
            .from("terms")
            .insert({
                term,
                description:
                    description || null,
                active,
            });


    if (error) {
        console.error(
            "Could not create term:",
            error
        );

        if (
            error.code === "23505"
        ) {
            redirect(
                "/admin/terms/new?error=duplicate"
            );
        }

        redirect(
            "/admin/terms/new?error=create"
        );
    }


    revalidatePath(
        "/admin/terms"
    );


    redirect(
        "/admin/terms?created=1"
    );
}


export async function updateTermAction(
    termId: string,
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const term =
        String(
            formData.get("term") ?? ""
        ).trim();


    const description =
        String(
            formData.get("description") ?? ""
        ).trim();


    const active =
        formData.get("active") === "on";


    if (!term) {
        redirect(
            `/admin/terms/${termId}/edit?error=missing_term`
        );
    }


    const {
        error,
    } =
        await supabase
            .from("terms")
            .update({
                term,
                description:
                    description || null,
                active,
                updated_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                termId
            );


    if (error) {
        console.error(
            "Could not update term:",
            error
        );

        if (
            error.code === "23505"
        ) {
            redirect(
                `/admin/terms/${termId}/edit?error=duplicate`
            );
        }

        redirect(
            `/admin/terms/${termId}/edit?error=update`
        );
    }


    revalidatePath(
        "/admin/terms"
    );


    redirect(
        "/admin/terms?updated=1"
    );
}


export async function deleteTermAction(
    termId: string,
    _formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        error,
    } =
        await supabase
            .from("terms")
            .delete()
            .eq(
                "id",
                termId
            );


    if (error) {
        console.error(
            "Could not delete term:",
            error
        );

        redirect(
            "/admin/terms?error=delete"
        );
    }


    revalidatePath(
        "/admin/terms"
    );


    redirect(
        "/admin/terms?deleted=1"
    );
}