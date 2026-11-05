/* eslint-disable @next/next/no-img-element */

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";


type VoteRow = {
    id: string;
    created_at: string;
    user_id: string;
    generation_id: string;
    vote: number;
};


type ProfileRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
};


type GenerationRow = {
    id: string;
    image_url: string;
    caption: string | null;
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
            hour: "numeric",
            minute: "2-digit",
        }
    ).format(
        new Date(
            dateString
        )
    );
}


export default async function VotesPage() {
    const {
        supabase,
    } =
        await requireSuperadmin();


    /*
     * ==========================================
     * LOAD DATA
     * ==========================================
     */

    const [
        votesResult,
        profilesResult,
        generationsResult,
    ] =
        await Promise.all([
            supabase
                .from(
                    "votes"
                )
                .select(
                    `
                    id,
                    created_at,
                    user_id,
                    generation_id,
                    vote
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                ),

            supabase
                .from(
                    "profiles"
                )
                .select(
                    `
                    id,
                    first_name,
                    last_name,
                    avatar_url
                    `
                ),

            supabase
                .from(
                    "generations"
                )
                .select(
                    `
                    id,
                    image_url,
                    caption
                    `
                ),
        ]);


    if (
        votesResult.error
    ) {
        console.error(
            "Could not load votes:",
            votesResult.error
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
        generationsResult.error
    ) {
        console.error(
            "Could not load generations:",
            generationsResult.error
        );
    }


    const votes =
        (
            votesResult.data ??
            []
        ) as VoteRow[];


    const profiles =
        (
            profilesResult.data ??
            []
        ) as ProfileRow[];


    const generations =
        (
            generationsResult.data ??
            []
        ) as GenerationRow[];


    /*
     * ==========================================
     * LOOKUP MAPS
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


    const generationMap =
        new Map(
            generations.map(
                (
                    generation
                ) => [
                    generation.id,
                    generation,
                ]
            )
        );


    function getUserName(
        userId: string
    ) {
        const profile =
            profileMap.get(
                userId
            );


        if (
            !profile
        ) {
            return "Unknown user";
        }


        const name =
            [
                profile.first_name,
                profile.last_name,
            ]
                .filter(Boolean)
                .join(" ")
                .trim();


        return (
            name ||
            "Campus creator"
        );
    }


    function getInitial(
        userId: string
    ) {
        return (
            getUserName(
                userId
            )
                .charAt(0)
                .toUpperCase() ||
            "?"
        );
    }


    /*
     * ==========================================
     * STATISTICS
     * ==========================================
     */

    const totalVotes =
        votes.length;


    const funnyVotes =
        votes.filter(
            (
                vote
            ) =>
                vote.vote ===
                1
        ).length;


    const notFunnyVotes =
        votes.filter(
            (
                vote
            ) =>
                vote.vote ===
                -1
        ).length;


    const funnyPercentage =
        totalVotes > 0
            ? Math.round(
                (
                    funnyVotes /
                    totalVotes
                ) *
                100
            )
            : 0;


    const score =
        funnyVotes -
        notFunnyVotes;


    /*
     * ==========================================
     * MOST VOTED MEME
     * ==========================================
     */

    const voteCountMap =
        new Map<
            string,
            number
        >();


    for (
        const vote of votes
        ) {
        voteCountMap.set(
            vote.generation_id,

            (
                voteCountMap.get(
                    vote.generation_id
                ) ??
                0
            ) + 1
        );
    }


    const mostVotedEntry =
        [
            ...voteCountMap.entries(),
        ].sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        )[0];


    const mostVotedMeme =
        mostVotedEntry
            ? generationMap.get(
                mostVotedEntry[0]
            )
            : null;


    const mostVotedCount =
        mostVotedEntry?.[1] ??
        0;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* ======================================
                HEADER
            ====================================== */}

            <div>

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    COMMUNITY
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                    Votes
                </h1>


                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Review Funny and Not Funny reactions across Meme Lab.
                </p>

            </div>


            {/* ======================================
                STATS
            ====================================== */}

            <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        TOTAL VOTES
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {totalVotes}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">
                        Community reactions
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        FUNNY
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {funnyVotes}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">
                        Positive reactions
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        NOT FUNNY
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {notFunnyVotes}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">
                        Negative reactions
                    </p>

                </div>


                <div className="rounded-3xl bg-black p-6 text-white">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        SCORE
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {score >
                        0
                            ? "+"
                            : ""}
                        {score}
                    </p>

                    <p className="mt-3 text-sm text-zinc-500">
                        Funny minus Not Funny
                    </p>

                </div>

            </section>


            {/* ======================================
                SENTIMENT + MOST VOTED
            ====================================== */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">

                {/* SENTIMENT */}

                <div className="rounded-3xl border border-zinc-200 bg-white p-7">

                    <div className="flex items-start justify-between gap-4">

                        <div>

                            <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                                VOTE SENTIMENT
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                {funnyPercentage}% Funny
                            </h2>

                        </div>


                        <span className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium text-zinc-500">
                            {totalVotes} votes
                        </span>

                    </div>


                    <div className="mt-8 h-4 overflow-hidden rounded-full bg-zinc-100">

                        <div
                            className="h-full rounded-full bg-black"
                            style={{
                                width:
                                    `${funnyPercentage}%`,
                            }}
                        />

                    </div>


                    <div className="mt-5 flex justify-between">

                        <div>

                            <p className="text-xs text-zinc-400">
                                FUNNY
                            </p>

                            <p className="mt-1 text-2xl font-semibold">
                                {funnyVotes}
                            </p>

                        </div>


                        <div className="text-right">

                            <p className="text-xs text-zinc-400">
                                NOT FUNNY
                            </p>

                            <p className="mt-1 text-2xl font-semibold">
                                {notFunnyVotes}
                            </p>

                        </div>

                    </div>

                </div>


                {/* MOST VOTED */}

                <div className="rounded-3xl border border-zinc-200 bg-white p-7">

                    <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                        MOST DISCUSSED
                    </p>


                    {mostVotedMeme ? (
                        <>

                            <img
                                src={
                                    mostVotedMeme.image_url
                                }
                                alt=""
                                className="mt-5 aspect-[16/9] w-full rounded-2xl bg-zinc-100 object-cover"
                            />


                            <p className="mt-4 line-clamp-2 text-lg font-semibold leading-6">
                                {mostVotedMeme.caption ||
                                    "Untitled meme"}
                            </p>


                            <p className="mt-3 text-sm text-zinc-400">
                                {mostVotedCount}{" "}
                                {mostVotedCount ===
                                1
                                    ? "vote"
                                    : "votes"}
                            </p>

                        </>
                    ) : (
                        <p className="mt-6 text-sm text-zinc-400">
                            No voting activity yet.
                        </p>
                    )}

                </div>

            </section>


            {/* ======================================
                VOTE HISTORY
            ====================================== */}

            <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-200 px-7 py-6">

                    <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                        VOTE HISTORY
                    </p>


                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        All reactions
                    </h2>


                    <p className="mt-2 text-sm text-zinc-400">
                        Read-only record of community voting activity.
                    </p>

                </div>


                {votes.length >
                0 ? (
                    <div className="overflow-x-auto">

                        <table className="w-full border-collapse">

                            <thead>

                            <tr className="border-b border-zinc-200 bg-zinc-50 text-left">

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    USER
                                </th>

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    MEME
                                </th>

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    VOTE
                                </th>

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    DATE
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {votes.map(
                                (
                                    vote
                                ) => {
                                    const profile =
                                        profileMap.get(
                                            vote.user_id
                                        );


                                    const meme =
                                        generationMap.get(
                                            vote.generation_id
                                        );


                                    return (
                                        <tr
                                            key={
                                                vote.id
                                            }
                                            className="border-b border-zinc-100 last:border-b-0 transition hover:bg-zinc-50"
                                        >

                                            {/* USER */}

                                            <td className="px-7 py-5">

                                                <div className="flex items-center gap-3">

                                                    {profile?.avatar_url ? (
                                                        <img
                                                            src={
                                                                profile.avatar_url
                                                            }
                                                            alt=""
                                                            className="h-10 w-10 rounded-full bg-zinc-100 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-black text-xs font-semibold text-white">
                                                            {getInitial(
                                                                vote.user_id
                                                            )}
                                                        </div>
                                                    )}


                                                    <p className="text-sm font-semibold">
                                                        {getUserName(
                                                            vote.user_id
                                                        )}
                                                    </p>

                                                </div>

                                            </td>


                                            {/* MEME */}

                                            <td className="px-7 py-5">

                                                <div className="flex max-w-md items-center gap-3">

                                                    {meme ? (
                                                        <img
                                                            src={
                                                                meme.image_url
                                                            }
                                                            alt=""
                                                            className="h-11 w-14 shrink-0 rounded-lg bg-zinc-100 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-11 w-14 shrink-0 rounded-lg bg-zinc-100" />
                                                    )}


                                                    <p className="line-clamp-2 text-sm text-zinc-700">
                                                        {meme?.caption ||
                                                            "Deleted or unavailable meme"}
                                                    </p>

                                                </div>

                                            </td>


                                            {/* VOTE */}

                                            <td className="px-7 py-5">

                                                {vote.vote ===
                                                1 ? (
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                                                            <span>
                                                                ↑
                                                            </span>

                                                            Funny

                                                        </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">

                                                            <span>
                                                                ↓
                                                            </span>

                                                            Not Funny

                                                        </span>
                                                )}

                                            </td>


                                            {/* DATE */}

                                            <td className="whitespace-nowrap px-7 py-5 text-xs text-zinc-400">
                                                {formatDate(
                                                    vote.created_at
                                                )}
                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                            </tbody>

                        </table>

                    </div>
                ) : (
                    <div className="px-8 py-16 text-center">

                        <p className="text-lg font-semibold">
                            No votes yet.
                        </p>

                        <p className="mt-2 text-sm text-zinc-400">
                            Community reactions will appear here.
                        </p>

                    </div>
                )}

            </section>

        </div>
    );
}