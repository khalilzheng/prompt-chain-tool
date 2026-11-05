import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    updateMemeAction,
} from "../../actions";


type EditMemePageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


export default async function EditMemePage({
                                               params,
                                               searchParams,
                                           }: EditMemePageProps) {
    const {
        id,
    } =
        await params;


    const query =
        await searchParams;


    const {
        supabase,
    } =
        await requireSuperadmin();


    const [
        memeResult,
        profilesResult,
    ] =
        await Promise.all([
            supabase
                .from(
                    "generations"
                )
                .select(
                    `
                    id,
                    user_id,
                    image_url,
                    caption,
                    prompt
                    `
                )
                .eq(
                    "id",
                    id
                )
                .maybeSingle(),

            supabase
                .from(
                    "profiles"
                )
                .select(
                    "id, first_name, last_name"
                )
                .order(
                    "first_name",
                    {
                        ascending:
                            true,
                    }
                ),
        ]);


    if (
        memeResult.error ||
        !memeResult.data
    ) {
        notFound();
    }


    const meme =
        memeResult.data;


    const updateAction =
        updateMemeAction.bind(
            null,
            id
        );


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/memes"
                className="text-sm font-medium text-zinc-500 hover:text-black"
            >
                ← Back to memes
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    UPDATE
                </p>

                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Edit meme
                </h1>

                <p className="mt-3 text-sm text-zinc-500">
                    Update the stored media, caption, prompt, or creator.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    The update could not be completed.
                </div>
            )}


            <form
                action={
                    updateAction
                }
                className="mt-9 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-8"
            >

                <div>

                    <label
                        htmlFor="user_id"
                        className="text-sm font-semibold"
                    >
                        Creator
                    </label>

                    <select
                        id="user_id"
                        name="user_id"
                        required
                        defaultValue={
                            meme.user_id
                        }
                        className="mt-4 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-black"
                    >

                        {(profilesResult.data ??
                            []).map(
                            (
                                profile
                            ) => {
                                const name =
                                    [
                                        profile.first_name,
                                        profile.last_name,
                                    ]
                                        .filter(
                                            Boolean
                                        )
                                        .join(
                                            " "
                                        )
                                        .trim() ||
                                    "Campus creator";


                                return (
                                    <option
                                        key={
                                            profile.id
                                        }
                                        value={
                                            profile.id
                                        }
                                    >
                                        {name}
                                    </option>
                                );
                            }
                        )}

                    </select>

                </div>


                <div className="mt-7">

                    <label
                        htmlFor="image_url"
                        className="text-sm font-semibold"
                    >
                        Image URL
                    </label>

                    <input
                        id="image_url"
                        name="image_url"
                        type="url"
                        required
                        defaultValue={
                            meme.image_url
                        }
                        className="mt-4 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none focus:border-black"
                    />

                </div>


                <div className="mt-7">

                    <label
                        htmlFor="caption"
                        className="text-sm font-semibold"
                    >
                        Caption
                    </label>

                    <textarea
                        id="caption"
                        name="caption"
                        required
                        rows={4}
                        defaultValue={
                            meme.caption ??
                            ""
                        }
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none focus:border-black"
                    />

                </div>


                <div className="mt-7">

                    <label
                        htmlFor="prompt"
                        className="text-sm font-semibold"
                    >
                        Prompt
                    </label>

                    <textarea
                        id="prompt"
                        name="prompt"
                        rows={4}
                        defaultValue={
                            meme.prompt ??
                            ""
                        }
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none focus:border-black"
                    />

                </div>


                <div className="mt-8 flex gap-3">

                    <Link
                        href="/admin/memes"
                        className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold"
                    >
                        Cancel
                    </Link>


                    <button
                        type="submit"
                        className="h-12 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Save changes
                    </button>

                </div>

            </form>

        </div>
    );
}