/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    deleteMemeAction,
} from "./actions";


type MemesPageProps = {
    searchParams: Promise<{
        created?: string;
        updated?: string;
        deleted?: string;
        error?: string;
    }>;
};


type GenerationRow = {
    id: string;
    created_at: string;
    user_id: string;
    image_url: string;
    prompt: string | null;
    caption: string | null;
};


type ProfileRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
};


type VoteRow = {
    generation_id: string;
    vote: number;
};


function formatDate(
    dateString: string
) {
    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(
        new Date(
            dateString
        )
    );
}


export default async function MemesPage({
                                            searchParams,
                                        }: MemesPageProps) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const query =
        await searchParams;


    /*
     * ==========================================
     * LOAD DATA
     * ==========================================
     */

    const [
        generationsResult,
        profilesResult,
        votesResult,
    ] =
        await Promise.all([
            supabase
                .from(
                    "generations"
                )
                .select(
                    `
                    id,
                    created_at,
                    user_id,
                    image_url,
                    prompt,
                    caption
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false,
                    }
                ),

            supabase
                .from(
                    "profiles"
                )
                .select(
                    "id, first_name, last_name"
                ),

            supabase
                .from(
                    "votes"
                )
                .select(
                    "generation_id, vote"
                ),
        ]);


    if (
        generationsResult.error
    ) {
        console.error(
            "Could not load memes:",
            generationsResult.error
        );
    }


    if (
        profilesResult.error
    ) {
        console.error(
            "Could not load profiles:",
            profilesResult.error
        );
    }


    if (
        votesResult.error
    ) {
        console.error(
            "Could not load votes:",
            votesResult.error
        );
    }


    const generations =
        (
            generationsResult.data ??
            []
        ) as GenerationRow[];


    const profiles =
        (
            profilesResult.data ??
            []
        ) as ProfileRow[];


    const votes =
        (
            votesResult.data ??
            []
        ) as VoteRow[];


    /*
     * ==========================================
     * PROFILE LOOKUP
     * ==========================================
     */

    const profileMap =
        new Map(
            profiles.map(
                (
                    profile
                ) => [
                    profile.id,
                    profile,
                ]
            )
        );


    function getCreatorName(
        userId: string
    ) {
        const profile =
            profileMap.get(
                userId
            );


        if (
            !profile
        ) {
            return "Unknown creator";
        }


        const name =
            [
                profile.first_name,
                profile.last_name,
            ]
                .filter(
                    Boolean
                )
                .join(" ")
                .trim();


        return (
            name ||
            "Campus creator"
        );
    }


    /*
     * ==========================================
     * VOTE COUNTS
     * ==========================================
     */

    const voteMap =
        new Map<
            string,
            {
                funny: number;
                notFunny: number;
            }
        >();


    for (
        const vote of votes
        ) {
        const current =
            voteMap.get(
                vote.generation_id
            ) ?? {
                funny: 0,
                notFunny: 0,
            };


        if (
            vote.vote ===
            1
        ) {
            current.funny +=
                1;
        }


        if (
            vote.vote ===
            -1
        ) {
            current.notFunny +=
                1;
        }


        voteMap.set(
            vote.generation_id,
            current
        );
    }


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* HEADER */}

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        CONTENT
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        Memes
                    </h1>


                    <p className="mt-3 text-sm text-zinc-500">
                        Create, review, edit, and remove AI-generated media.
                    </p>

                </div>


                <Link
                    href="/admin/memes/new"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-7 text-sm font-semibold shadow-sm transition hover:bg-blue-700"
                    style={{
                        color:
                            "#ffffff",
                    }}
                >
                    <span className="mr-2 text-base">
                        +
                    </span>

                    Create meme
                </Link>

            </div>


            {/* STATUS MESSAGES */}

            {query.created ===
                "1" && (
                    <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
                        Meme created successfully.
                    </div>
                )}


            {query.updated ===
                "1" && (
                    <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
                        Meme updated successfully.
                    </div>
                )}


            {query.deleted ===
                "1" && (
                    <div className="mt-7 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium text-zinc-600">
                        Meme deleted.
                    </div>
                )}


            {query.error && (
                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    Something went wrong. The database was not changed.
                </div>
            )}


            {/* SECTION TITLE */}

            <div className="mt-9 flex items-center justify-between">

                <div>

                    <p className="text-sm font-semibold text-zinc-900">
                        All generated media
                    </p>


                    <p className="mt-1 text-xs text-zinc-400">
                        {generations.length} total{" "}
                        {generations.length ===
                        1
                            ? "meme"
                            : "memes"}
                    </p>

                </div>

            </div>


            {/* MEME GRID */}

            {generations.length >
            0 ? (
                <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {generations.map(
                        (
                            meme
                        ) => {
                            const stats =
                                voteMap.get(
                                    meme.id
                                ) ?? {
                                    funny: 0,
                                    notFunny: 0,
                                };


                            const score =
                                stats.funny -
                                stats.notFunny;


                            return (
                                <article
                                    key={
                                        meme.id
                                    }
                                    className="overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                                >

                                    {/* IMAGE */}

                                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">

                                        <img
                                            src={
                                                meme.image_url
                                            }
                                            alt={
                                                meme.caption ??
                                                "Meme"
                                            }
                                            className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                                        />

                                    </div>


                                    {/* CONTENT */}

                                    <div className="p-6">

                                        <p className="line-clamp-3 min-h-[4.5rem] text-lg font-semibold leading-6 tracking-tight text-zinc-950">
                                            {meme.caption ||
                                                "Untitled meme"}
                                        </p>


                                        <div className="mt-5 flex items-end justify-between gap-4">

                                            <div className="min-w-0">

                                                <p className="truncate text-xs font-semibold text-zinc-700">
                                                    {getCreatorName(
                                                        meme.user_id
                                                    )}
                                                </p>


                                                <p className="mt-1 text-xs text-zinc-400">
                                                    {formatDate(
                                                        meme.created_at
                                                    )}
                                                </p>

                                            </div>


                                            <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-700">

                                                <span
                                                    title="Funny votes"
                                                    className="font-medium"
                                                >
                                                    ↑{" "}
                                                    {
                                                        stats.funny
                                                    }
                                                </span>


                                                <span
                                                    title="Not Funny votes"
                                                    className="font-medium"
                                                >
                                                    ↓{" "}
                                                    {
                                                        stats.notFunny
                                                    }
                                                </span>

                                            </div>

                                        </div>


                                        {(stats.funny >
                                            0 ||
                                            stats.notFunny >
                                            0) && (
                                            <div className="mt-4">

                                                <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-500">
                                                    Score{" "}
                                                    {score >
                                                    0
                                                        ? "+"
                                                        : ""}
                                                    {
                                                        score
                                                    }
                                                </span>

                                            </div>
                                        )}


                                        {/* ACTIONS */}

                                        <div className="mt-6 flex gap-3 border-t border-zinc-100 pt-5">

                                            <Link
                                                href={`/admin/memes/${meme.id}/edit`}
                                                className="flex h-10 flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-semibold transition hover:border-zinc-300 hover:bg-zinc-50"
                                                style={{
                                                    color:
                                                        "#18181b",
                                                }}
                                            >
                                                Edit
                                            </Link>


                                            <form
                                                action={deleteMemeAction.bind(
                                                    null,
                                                    meme.id
                                                )}
                                                className="flex-1"
                                            >

                                                <button
                                                    type="submit"
                                                    className="h-10 w-full rounded-full border border-red-200 bg-white text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
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

                </section>
            ) : (
                <div className="mt-8 rounded-3xl border border-zinc-200 bg-white px-8 py-20 text-center">

                    <p className="text-lg font-semibold text-zinc-900">
                        No memes yet.
                    </p>


                    <p className="mt-2 text-sm text-zinc-400">
                        Create your first admin-managed meme.
                    </p>


                    <Link
                        href="/admin/memes/new"
                        className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold transition hover:bg-blue-700"
                        style={{
                            color:
                                "#ffffff",
                        }}
                    >
                        + Create meme
                    </Link>

                </div>
            )}

        </div>
    );
}