"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";


export async function createExampleAction(
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const inputText =
        String(
            formData.get("input_text") ?? ""
        ).trim();


    const outputText =
        String(
            formData.get("output_text") ?? ""
        ).trim();


    const notes =
        String(
            formData.get("notes") ?? ""
        ).trim();


    if (
        !inputText ||
        !outputText
    ) {
        redirect(
            "/admin/examples/new?error=missing_fields"
        );
    }


    const {
        error,
    } =
        await supabase
            .from("generation_examples")
            .insert({
                input_text: inputText,
                output_text: outputText,
                notes:
                    notes || null,
            });


    if (error) {
        console.error(
            "Could not create generation example:",
            error
        );

        redirect(
            "/admin/examples/new?error=create"
        );
    }


    revalidatePath(
        "/admin/examples"
    );


    redirect(
        "/admin/examples?created=1"
    );
}


export async function updateExampleAction(
    exampleId: string,
    formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const inputText =
        String(
            formData.get("input_text") ?? ""
        ).trim();


    const outputText =
        String(
            formData.get("output_text") ?? ""
        ).trim();


    const notes =
        String(
            formData.get("notes") ?? ""
        ).trim();


    if (
        !inputText ||
        !outputText
    ) {
        redirect(
            `/admin/examples/${exampleId}/edit?error=missing_fields`
        );
    }


    const {
        error,
    } =
        await supabase
            .from("generation_examples")
            .update({
                input_text: inputText,
                output_text: outputText,
                notes:
                    notes || null,
                updated_at:
                    new Date().toISOString(),
            })
            .eq(
                "id",
                exampleId
            );


    if (error) {
        console.error(
            "Could not update generation example:",
            error
        );

        redirect(
            `/admin/examples/${exampleId}/edit?error=update`
        );
    }


    revalidatePath(
        "/admin/examples"
    );


    redirect(
        "/admin/examples?updated=1"
    );
}


export async function deleteExampleAction(
    exampleId: string,
    _formData: FormData
) {
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        error,
    } =
        await supabase
            .from("generation_examples")
            .delete()
            .eq(
                "id",
                exampleId
            );


    if (error) {
        console.error(
            "Could not delete generation example:",
            error
        );

        redirect(
            "/admin/examples?error=delete"
        );
    }


    revalidatePath(
        "/admin/examples"
    );


    redirect(
        "/admin/examples?deleted=1"
    );
}