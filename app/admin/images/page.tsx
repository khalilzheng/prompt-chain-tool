import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    deleteImageAction,
} from "./actions";


type ImagesPageProps =
    {
        searchParams: Promise<{
            created?: string;
            updated?: string;
            deleted?: string;
        }>;
    };


function formatDate(
    value: string
)
{
    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(
        new Date(value)
    );
}


export default async function ImagesPage({
                                             searchParams,
                                         }: ImagesPageProps)
{
    const {
        supabase,
    } = await requireSuperadmin();


    const params =
        await searchParams;


    const {
        data: images,
        error: imagesError,
    } = await supabase
        .from("images")
        .select(
            "id, owner_id, image_url, storage_path, alt_text, created_at, updated_at"
        )
        .order(
            "created_at",
            {
                ascending: false,
            }
        );


    if (imagesError)
    {
        console.error(
            "Could not load images:",
            imagesError
        );
    }


    const {
        data: profiles,
        error: profilesError,
    } = await supabase
        .from("profiles")
        .select(
            "id, first_name, last_name"
        );


    if (profilesError)
    {
        console.error(
            "Could not load image owners:",
            profilesError
        );
    }


    const safeImages =
        images || [];

    const safeProfiles =
        profiles || [];


    const profileMap =
        new Map(
            safeProfiles.map(
                (profile) =>
                    [
                        profile.id,
                        `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                        || "Unnamed user",
                    ]
            )
        );


    let successMessage = "";


    if (params.created === "1")
    {
        successMessage =
            "Image uploaded successfully.";
    }
    else if (params.updated === "1")
    {
        successMessage =
            "Image updated successfully.";
    }
    else if (params.deleted === "1")
    {
        successMessage =
            "Image deleted.";
    }


    const storageBackedImages =
        safeImages.filter(
            (image) =>
                Boolean(
                    image.storage_path
                )
        ).length;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div className="mx-auto max-w-7xl">

                <div className="flex items-end justify-between gap-6">

                    <div>

                        <p className="text-[10px] font-semibold tracking-[0.24em] text-zinc-500">
                            MEDIA
                        </p>

                        <h1 className="mt-3 text-5xl font-bold tracking-[-0.04em]">
                            Images
                        </h1>

                        <p className="mt-3 text-sm text-zinc-500">
                            Manage images available to Meme Lab and upload new media.
                        </p>

                    </div>


                    <Link
                        href="/admin/images/new"
                        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        + Upload image
                    </Link>

                </div>


                {successMessage && (

                    <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                        {successMessage}
                    </div>

                )}


                <div className="mt-8 grid gap-4 md:grid-cols-2">

                    <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                        <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500">
                            IMAGES
                        </p>

                        <p className="mt-4 text-4xl font-bold">
                            {safeImages.length}
                        </p>

                        <p className="mt-2 text-sm text-zinc-500">
                            Media records in database
                        </p>

                    </div>


                    <div className="rounded-3xl bg-black p-6 text-white">

                        <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500">
                            STORAGE MANAGED
                        </p>

                        <p className="mt-4 text-4xl font-bold">
                            {storageBackedImages}
                        </p>

                        <p className="mt-2 text-sm text-zinc-500">
                            Images connected to Supabase Storage
                        </p>

                    </div>

                </div>


                {safeImages.length === 0
                    ? (

                        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white px-8 py-20 text-center">

                            <p className="text-lg font-semibold">
                                No images found.
                            </p>

                            <p className="mt-2 text-sm text-zinc-500">
                                Upload an image to create your first media record.
                            </p>

                        </div>

                    )
                    : (

                        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                            {safeImages.map(
                                (image) =>
                                {
                                    const ownerName =
                                        image.owner_id
                                            ? profileMap.get(
                                            image.owner_id
                                        ) || "Unknown user"
                                            : "No owner";


                                    return (
                                        <article
                                            key={image.id}
                                            className="overflow-hidden rounded-3xl border border-zinc-200 bg-white"
                                        >

                                            <div className="aspect-[4/3] bg-zinc-100">

                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={image.image_url}
                                                    alt={
                                                        image.alt_text
                                                        || "Meme Lab image"
                                                    }
                                                    className="h-full w-full object-cover"
                                                />

                                            </div>


                                            <div className="p-5">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="min-w-0">

                                                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400">
                                                            ALT TEXT
                                                        </p>

                                                        <p className="mt-2 line-clamp-2 font-semibold">
                                                            {
                                                                image.alt_text
                                                                || "No alt text"
                                                            }
                                                        </p>

                                                    </div>


                                                    {image.storage_path
                                                        ? (

                                                            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700">
                                                                Storage
                                                            </span>

                                                        )
                                                        : (

                                                            <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold text-zinc-500">
                                                                URL
                                                            </span>

                                                        )}

                                                </div>


                                                <div className="mt-5 border-t border-zinc-100 pt-4">

                                                    <div className="flex items-center justify-between text-xs text-zinc-500">

                                                        <span>
                                                            {ownerName}
                                                        </span>

                                                        <span>
                                                            {
                                                                formatDate(
                                                                    image.created_at
                                                                )
                                                            }
                                                        </span>

                                                    </div>


                                                    <p className="mt-3 truncate font-mono text-[10px] text-zinc-400">
                                                        {image.id}
                                                    </p>

                                                </div>


                                                <div className="mt-5 flex gap-3">

                                                    <Link
                                                        href={
                                                            `/admin/images/${image.id}/edit`
                                                        }
                                                        className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-center text-sm font-semibold transition hover:bg-zinc-50"
                                                    >
                                                        Edit
                                                    </Link>


                                                    <form
                                                        action={
                                                            deleteImageAction.bind(
                                                                null,
                                                                image.id
                                                            )
                                                        }
                                                        className="flex-1"
                                                    >

                                                        <button
                                                            type="submit"
                                                            className="w-full rounded-full border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                        >
                                                            Delete
                                                        </button>

                                                    </form>

                                                </div>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    )}

            </div>

        </div>
    );
}