import Link from "next/link";
import { notFound } from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    updateImageAction,
} from "../../actions";


type EditImagePageProps =
    {
        params: Promise<{
            id: string;
        }>;
    };


export default async function EditImagePage({
                                                params,
                                            }: EditImagePageProps)
{
    const {
        id,
    } = await params;


    const {
        supabase,
    } = await requireSuperadmin();


    const {
        data: image,
        error: imageError,
    } = await supabase
        .from("images")
        .select(
            "id, owner_id, image_url, storage_path, alt_text"
        )
        .eq(
            "id",
            id
        )
        .maybeSingle();


    if (imageError)
    {
        console.error(
            "Could not load image:",
            imageError
        );
    }


    if (!image)
    {
        notFound();
    }


    const {
        data: profiles,
        error: profilesError,
    } = await supabase
        .from("profiles")
        .select(
            "id, first_name, last_name"
        )
        .order(
            "first_name"
        );


    if (profilesError)
    {
        console.error(
            "Could not load profiles:",
            profilesError
        );
    }


    const safeProfiles =
        profiles || [];


    const updateAction =
        updateImageAction.bind(
            null,
            image.id
        );


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div className="mx-auto max-w-4xl">

                <Link
                    href="/admin/images"
                    className="text-sm text-zinc-600 transition hover:text-black"
                >
                    ← Back to images
                </Link>


                <p className="mt-10 text-[10px] font-semibold tracking-[0.24em] text-zinc-500">
                    EDIT
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em]">
                    Edit image
                </h1>

                <p className="mt-3 text-sm text-zinc-500">
                    Update image ownership and accessibility information.
                </p>


                <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                    <div className="max-h-[420px] bg-zinc-100">

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.image_url}
                            alt={
                                image.alt_text
                                || "Meme Lab image"
                            }
                            className="mx-auto max-h-[420px] w-full object-contain"
                        />

                    </div>


                    <form
                        action={updateAction}
                        className="p-7"
                    >

                        <div>

                            <label
                                htmlFor="owner_id"
                                className="text-sm font-semibold"
                            >
                                Owner
                            </label>

                            <select
                                id="owner_id"
                                name="owner_id"
                                defaultValue={
                                    image.owner_id || ""
                                }
                                className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-black"
                            >

                                <option value="">
                                    No owner
                                </option>

                                {safeProfiles.map(
                                    (profile) =>
                                    {
                                        const name =
                                            `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
                                            || "Unnamed user";


                                        return (
                                            <option
                                                key={profile.id}
                                                value={profile.id}
                                            >
                                                {name}
                                            </option>
                                        );
                                    }
                                )}

                            </select>

                        </div>


                        <div className="mt-6">

                            <label
                                htmlFor="alt_text"
                                className="text-sm font-semibold"
                            >
                                Alt text
                            </label>

                            <textarea
                                id="alt_text"
                                name="alt_text"
                                rows={4}
                                defaultValue={
                                    image.alt_text || ""
                                }
                                className="mt-3 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm outline-none focus:border-black"
                            />

                        </div>


                        <div className="mt-6 rounded-2xl bg-zinc-50 p-4">

                            <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400">
                                STORAGE PATH
                            </p>

                            <p className="mt-2 break-all font-mono text-xs text-zinc-600">
                                {
                                    image.storage_path
                                    || "Legacy/external image — no Storage path"
                                }
                            </p>

                        </div>


                        <div className="mt-8 flex gap-3">

                            <Link
                                href="/admin/images"
                                className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold transition hover:bg-zinc-50"
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                className="rounded-full bg-black px-7 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                Save changes
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}