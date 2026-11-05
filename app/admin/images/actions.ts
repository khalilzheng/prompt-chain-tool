"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

const IMAGE_BUCKET = "meme-images";


function sanitizeFileName(fileName: string)
{
    return fileName
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]/g, "-");
}


export async function createImageAction(formData: FormData)
{
    const {
        user,
        supabase,
    } = await requireSuperadmin();


    const file = formData.get("file") as File | null;

    const ownerId =
        String(formData.get("owner_id") || "").trim();

    const altText =
        String(formData.get("alt_text") || "").trim();


    if (!file || file.size === 0)
    {
        throw new Error("Please choose an image to upload.");
    }


    if (!file.type.startsWith("image/"))
    {
        throw new Error("The selected file must be an image.");
    }


    const safeFileName =
        sanitizeFileName(file.name);

    const storagePath =
        `admin/${user.id}/${crypto.randomUUID()}-${safeFileName}`;


    const {
        error: uploadError,
    } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(
            storagePath,
            file,
            {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
            }
        );


    if (uploadError)
    {
        console.error(
            "Could not upload image:",
            uploadError
        );

        throw new Error(
            "Could not upload the image."
        );
    }


    const {
        data: publicUrlData,
    } = supabase.storage
        .from(IMAGE_BUCKET)
        .getPublicUrl(storagePath);


    const imageUrl =
        publicUrlData.publicUrl;


    const {
        error: insertError,
    } = await supabase
        .from("images")
        .insert({
            owner_id:
                ownerId || null,

            image_url:
            imageUrl,

            storage_path:
            storagePath,

            alt_text:
                altText || null,

            updated_at:
                new Date().toISOString(),
        });


    if (insertError)
    {
        console.error(
            "Could not create image record:",
            insertError
        );


        await supabase.storage
            .from(IMAGE_BUCKET)
            .remove([
                storagePath,
            ]);


        throw new Error(
            "The image uploaded, but the database record could not be created."
        );
    }


    revalidatePath("/admin/images");

    redirect(
        "/admin/images?created=1"
    );
}


export async function updateImageAction(
    imageId: string,
    formData: FormData
)
{
    const {
        supabase,
    } = await requireSuperadmin();


    const ownerId =
        String(formData.get("owner_id") || "").trim();

    const altText =
        String(formData.get("alt_text") || "").trim();


    const {
        error,
    } = await supabase
        .from("images")
        .update({
            owner_id:
                ownerId || null,

            alt_text:
                altText || null,

            updated_at:
                new Date().toISOString(),
        })
        .eq(
            "id",
            imageId
        );


    if (error)
    {
        console.error(
            "Could not update image:",
            error
        );

        throw new Error(
            "Could not update the image."
        );
    }


    revalidatePath("/admin/images");

    redirect(
        "/admin/images?updated=1"
    );
}


export async function deleteImageAction(
    imageId: string
)
{
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        data: image,
        error: imageError,
    } = await supabase
        .from("images")
        .select(
            "id, storage_path"
        )
        .eq(
            "id",
            imageId
        )
        .maybeSingle();


    if (imageError)
    {
        console.error(
            "Could not load image before deletion:",
            imageError
        );

        throw new Error(
            "Could not load the image."
        );
    }


    if (!image)
    {
        throw new Error(
            "Image not found."
        );
    }


    const {
        error: deleteError,
    } = await supabase
        .from("images")
        .delete()
        .eq(
            "id",
            imageId
        );


    if (deleteError)
    {
        console.error(
            "Could not delete image record:",
            deleteError
        );

        throw new Error(
            "Could not delete the image."
        );
    }


    if (image.storage_path)
    {
        const {
            error: storageError,
        } = await supabase.storage
            .from(IMAGE_BUCKET)
            .remove([
                image.storage_path,
            ]);


        if (storageError)
        {
            console.error(
                "Image database record was deleted, but Storage cleanup failed:",
                storageError
            );
        }
    }


    revalidatePath("/admin/images");

    redirect(
        "/admin/images?deleted=1"
    );
}