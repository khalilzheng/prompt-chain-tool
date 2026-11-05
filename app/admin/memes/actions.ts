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


function readRequiredString(
    formData: FormData,
    key: string
) {
    const value =
        formData.get(
            key
        );

    if (
        typeof value !==
        "string"
    ) {
        return "";
    }

    return value.trim();
}


export async function createMemeAction(
    formData: FormData
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const userId =
        readRequiredString(
            formData,
            "user_id"
        );

    const imageUrl =
        readRequiredString(
            formData,
            "image_url"
        );

    const caption =
        readRequiredString(
            formData,
            "caption"
        );

    const prompt =
        readRequiredString(
            formData,
            "prompt"
        );


    if (
        !userId ||
        !imageUrl ||
        !caption
    ) {
        redirect(
            "/admin/memes/new?error=missing_fields"
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "generations"
            )
            .insert({
                user_id:
                userId,

                image_url:
                imageUrl,

                caption,

                prompt:
                    prompt ||
                    null,
            });


    if (
        error
    ) {
        console.error(
            "Could not create meme:",
            error
        );

        redirect(
            "/admin/memes/new?error=create_failed"
        );
    }


    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/memes"
    );


    redirect(
        "/admin/memes?created=1"
    );
}


export async function updateMemeAction(
    memeId: string,
    formData: FormData
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const userId =
        readRequiredString(
            formData,
            "user_id"
        );

    const imageUrl =
        readRequiredString(
            formData,
            "image_url"
        );

    const caption =
        readRequiredString(
            formData,
            "caption"
        );

    const prompt =
        readRequiredString(
            formData,
            "prompt"
        );


    if (
        !memeId ||
        !userId ||
        !imageUrl ||
        !caption
    ) {
        redirect(
            `/admin/memes/${memeId}/edit?error=missing_fields`
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "generations"
            )
            .update({
                user_id:
                userId,

                image_url:
                imageUrl,

                caption,

                prompt:
                    prompt ||
                    null,
            })
            .eq(
                "id",
                memeId
            );


    if (
        error
    ) {
        console.error(
            "Could not update meme:",
            error
        );

        redirect(
            `/admin/memes/${memeId}/edit?error=update_failed`
        );
    }


    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/memes"
    );


    redirect(
        "/admin/memes?updated=1"
    );
}


export async function deleteMemeAction(
    memeId: string
) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    /*
     * Remove votes first.
     *
     * This prevents foreign-key relationships
     * from blocking deletion of the meme.
     */
    const {
        error:
            voteDeleteError,
    } =
        await supabase
            .from(
                "votes"
            )
            .delete()
            .eq(
                "generation_id",
                memeId
            );


    if (
        voteDeleteError
    ) {
        console.error(
            "Could not remove meme votes:",
            voteDeleteError
        );
    }


    const {
        error,
    } =
        await supabase
            .from(
                "generations"
            )
            .delete()
            .eq(
                "id",
                memeId
            );


    if (
        error
    ) {
        console.error(
            "Could not delete meme:",
            error
        );

        redirect(
            "/admin/memes?error=delete_failed"
        );
    }


    revalidatePath(
        "/admin"
    );

    revalidatePath(
        "/admin/memes"
    );


    redirect(
        "/admin/memes?deleted=1"
    );
}