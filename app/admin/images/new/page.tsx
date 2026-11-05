import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    createImageAction,
} from "../actions";


export default async function NewImagePage()
{
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        data: profiles,
        error,
    } = await supabase
        .from("profiles")
        .select(
            "id, first_name, last_name"
        )
        .order(
            "first_name"
        );


    if (error)
    {
        console.error(
            "Could not load profiles:",
            error
        );
    }


    const safeProfiles =
        profiles || [];


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
                    UPLOAD
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em]">
                    New image
                </h1>

                <p className="mt-3 text-sm text-zinc-500">
                    Upload a new image to Meme Lab&apos;s Supabase Storage.
                </p>


                <form
                    action={createImageAction}
                    className="mt-8 rounded-3xl border border-zinc-200 bg-white p-7"
                >

                    <div>

                        <label
                            htmlFor="file"
                            className="text-sm font-semibold"
                        >
                            Image file
                        </label>

                        <input
                            id="file"
                            name="file"
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            required
                            className="mt-3 block w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                        />

                        <p className="mt-2 text-xs text-zinc-400">
                            PNG, JPG, WEBP, or GIF.
                        </p>

                    </div>


                    <div className="mt-6">

                        <label
                            htmlFor="owner_id"
                            className="text-sm font-semibold"
                        >
                            Owner
                        </label>

                        <select
                            id="owner_id"
                            name="owner_id"
                            defaultValue=""
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
                            placeholder="Describe the image for accessibility..."
                            className="mt-3 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-3.5 text-sm outline-none focus:border-black"
                        />

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
                            Upload image
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}