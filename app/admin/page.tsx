import Link from "next/link";

import { requireSuperadmin } from "@/lib/requireSuperadmin";


type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
};


type Generation = {
    id: string;
    user_id: string | null;
    image_url: string | null;
    caption: string | null;
    created_at: string;
};


type Vote = {
    user_id: string | null;
    generation_id: string;
    vote: number;
    created_at: string;
};


type DailyActivity = {
    key: string;
    label: string;
    generations: number;
    votes: number;
};


type AdminPageProps = {
    searchParams: Promise<{
        days?: string | string[];
    }>;
};


const AVAILABLE_RANGES = [
    7,
    14,
    30,
];


function getSelectedDays(
    value: string | string[] | undefined
)
{
    const selectedValue =
        Array.isArray(value)
            ? value[0]
            : value;


    const parsedValue =
        Number(selectedValue);


    if (
        AVAILABLE_RANGES.includes(
            parsedValue
        )
    )
    {
        return parsedValue;
    }


    return 14;
}


function getNewYorkDateKey(
    value: string | Date
)
{
    const date =
        typeof value === "string"
            ? new Date(value)
            : value;


    const parts =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: "America/New_York",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }
        ).formatToParts(date);


    const year =
        parts.find(
            (part) =>
                part.type === "year"
        )?.value || "";


    const month =
        parts.find(
            (part) =>
                part.type === "month"
        )?.value || "";


    const day =
        parts.find(
            (part) =>
                part.type === "day"
        )?.value || "";


    return `${year}-${month}-${day}`;
}


function getNewYorkToday()
{
    const dateKey =
        getNewYorkDateKey(
            new Date()
        );


    const [
        year,
        month,
        day,
    ] =
        dateKey
            .split("-")
            .map(Number);


    return new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            12
        )
    );
}


function getDateKeyFromCalendarDate(
    date: Date
)
{
    const year =
        date.getUTCFullYear();


    const month =
        String(
            date.getUTCMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getUTCDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


function formatShortDate(
    date: Date
)
{
    return new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "UTC",
            month: "short",
            day: "numeric",
        }
    ).format(date);
}


function formatFullDate(
    value: string
)
{
    return new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "America/New_York",
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(
        new Date(value)
    );
}


function getProfileName(
    profile: Profile | undefined
)
{
    if (!profile)
    {
        return "Unknown user";
    }


    const fullName =
        `${profile.first_name || ""} ${profile.last_name || ""}`
            .trim();


    if (fullName)
    {
        return fullName;
    }


    return "Unnamed user";
}


export default async function AdminPage({
                                            searchParams,
                                        }: AdminPageProps)
{
    const resolvedSearchParams =
        await searchParams;


    const dashboardDays =
        getSelectedDays(
            resolvedSearchParams.days
        );


    const {
        profile,
        supabase,
    } =
        await requireSuperadmin();


    const [
        profilesResult,
        generationsResult,
        votesResult,
    ] =
        await Promise.all([
            supabase
                .from("profiles")
                .select(
                    `
                    id,
                    first_name,
                    last_name,
                    avatar_url
                    `
                ),

            supabase
                .from("generations")
                .select(
                    `
                    id,
                    user_id,
                    image_url,
                    caption,
                    created_at
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                ),

            supabase
                .from("votes")
                .select(
                    `
                    user_id,
                    generation_id,
                    vote,
                    created_at
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                ),
        ]);


    if (profilesResult.error)
    {
        console.error(
            "Could not load profiles:",
            profilesResult.error
        );
    }


    if (generationsResult.error)
    {
        console.error(
            "Could not load generations:",
            generationsResult.error
        );
    }


    if (votesResult.error)
    {
        console.error(
            "Could not load votes:",
            votesResult.error
        );
    }


    const profiles: Profile[] =
        profilesResult.data || [];


    const generations: Generation[] =
        generationsResult.data || [];


    const votes: Vote[] =
        votesResult.data || [];


    const profileMap =
        new Map(
            profiles.map(
                (currentProfile) => [
                    currentProfile.id,
                    currentProfile,
                ]
            )
        );


    // ---------------------------------------------------------
    // All-time statistics
    // ---------------------------------------------------------

    const totalUsers =
        profiles.length;


    const totalMemes =
        generations.length;


    const totalVotes =
        votes.length;


    const funnyVotes =
        votes.filter(
            (vote) =>
                vote.vote === 1
        ).length;


    const notFunnyVotes =
        votes.filter(
            (vote) =>
                vote.vote === -1
        ).length;


    const allTimeCommunityScore =
        funnyVotes -
        notFunnyVotes;


    // ---------------------------------------------------------
    // Build selected date range
    // ---------------------------------------------------------

    const today =
        getNewYorkToday();


    const dailyActivity: DailyActivity[] =
        [];


    for (
        let dayOffset =
            dashboardDays - 1;

        dayOffset >= 0;

        dayOffset--
    )
    {
        const currentDate =
            new Date(today);


        currentDate.setUTCDate(
            today.getUTCDate() -
            dayOffset
        );


        dailyActivity.push({
            key:
                getDateKeyFromCalendarDate(
                    currentDate
                ),

            label:
                formatShortDate(
                    currentDate
                ),

            generations: 0,

            votes: 0,
        });
    }


    const activityMap =
        new Map(
            dailyActivity.map(
                (day) => [
                    day.key,
                    day,
                ]
            )
        );


    // ---------------------------------------------------------
    // Count generations in selected range
    // ---------------------------------------------------------

    for (
        const generation
        of generations
        )
    {
        const dateKey =
            getNewYorkDateKey(
                generation.created_at
            );


        const day =
            activityMap.get(
                dateKey
            );


        if (day)
        {
            day.generations++;
        }
    }


    // ---------------------------------------------------------
    // Count votes in selected range
    // ---------------------------------------------------------

    for (
        const vote
        of votes
        )
    {
        const dateKey =
            getNewYorkDateKey(
                vote.created_at
            );


        const day =
            activityMap.get(
                dateKey
            );


        if (day)
        {
            day.votes++;
        }
    }


    const recentGenerationCount =
        dailyActivity.reduce(
            (
                total,
                day
            ) =>
                total +
                day.generations,
            0
        );


    const recentVoteCount =
        dailyActivity.reduce(
            (
                total,
                day
            ) =>
                total +
                day.votes,
            0
        );


    const recentDateKeys =
        new Set(
            dailyActivity.map(
                (day) =>
                    day.key
            )
        );


    const recentVotes =
        votes.filter(
            (vote) =>
                recentDateKeys.has(
                    getNewYorkDateKey(
                        vote.created_at
                    )
                )
        );


    const recentFunnyVotes =
        recentVotes.filter(
            (vote) =>
                vote.vote === 1
        ).length;


    const recentNotFunnyVotes =
        recentVotes.filter(
            (vote) =>
                vote.vote === -1
        ).length;


    const recentCommunityScore =
        recentFunnyVotes -
        recentNotFunnyVotes;


    const recentFunnyPercentage =
        recentVotes.length > 0
            ? Math.round(
                (
                    recentFunnyVotes /
                    recentVotes.length
                ) * 100
            )
            : 0;


    // ---------------------------------------------------------
    // Chart scaling
    // ---------------------------------------------------------

    const maximumDailyActivity =
        Math.max(
            1,
            ...dailyActivity.map(
                (day) =>
                    Math.max(
                        day.generations,
                        day.votes
                    )
            )
        );


    // ---------------------------------------------------------
    // Find top performing memes
    // ---------------------------------------------------------

    const memePerformance =
        generations.map(
            (generation) =>
            {
                const generationVotes =
                    votes.filter(
                        (vote) =>
                            vote.generation_id ===
                            generation.id
                    );


                const positiveVotes =
                    generationVotes.filter(
                        (vote) =>
                            vote.vote === 1
                    ).length;


                const negativeVotes =
                    generationVotes.filter(
                        (vote) =>
                            vote.vote === -1
                    ).length;


                return {
                    generation,

                    positiveVotes,

                    negativeVotes,

                    totalVotes:
                    generationVotes.length,

                    score:
                        positiveVotes -
                        negativeVotes,
                };
            }
        );


    const topMemes =
        [...memePerformance]
            .sort(
                (
                    firstMeme,
                    secondMeme
                ) =>
                {
                    if (
                        secondMeme.score !==
                        firstMeme.score
                    )
                    {
                        return (
                            secondMeme.score -
                            firstMeme.score
                        );
                    }


                    return (
                        secondMeme.totalVotes -
                        firstMeme.totalVotes
                    );
                }
            )
            .slice(
                0,
                3
            );


    // ---------------------------------------------------------
    // Find most active creator
    // ---------------------------------------------------------

    const creatorCounts =
        new Map<string, number>();


    for (
        const generation
        of generations
        )
    {
        if (
            !generation.user_id
        )
        {
            continue;
        }


        creatorCounts.set(
            generation.user_id,
            (
                creatorCounts.get(
                    generation.user_id
                ) || 0
            ) + 1
        );
    }


    let mostActiveCreatorId:
        string | null =
        null;


    let mostActiveCreatorCount =
        0;


    for (
        const [
            creatorId,
            creatorCount,
        ]
        of creatorCounts
        )
    {
        if (
            creatorCount >
            mostActiveCreatorCount
        )
        {
            mostActiveCreatorId =
                creatorId;

            mostActiveCreatorCount =
                creatorCount;
        }
    }


    const mostActiveCreator =
        mostActiveCreatorId
            ? profileMap.get(
                mostActiveCreatorId
            )
            : undefined;


    // ---------------------------------------------------------
    // Recent generations
    // ---------------------------------------------------------

    const recentGenerations =
        generations.slice(
            0,
            5
        );


    // ---------------------------------------------------------
    // Greeting
    // ---------------------------------------------------------

    const now =
        new Date();


    const currentHour =
        Number(
            new Intl.DateTimeFormat(
                "en-US",
                {
                    timeZone:
                        "America/New_York",

                    hour:
                        "2-digit",

                    hourCycle:
                        "h23",
                }
            ).format(
                now
            )
        );


    let greeting =
        "Good evening";


    if (
        currentHour < 12
    )
    {
        greeting =
            "Good morning";
    }
    else if (
        currentHour < 17
    )
    {
        greeting =
            "Good afternoon";
    }


    const firstName =
        profile.first_name ||
        "Admin";


    const rangeStart =
        dailyActivity[0]
            ?.label || "";


    const rangeEnd =
        dailyActivity[
        dailyActivity.length - 1
            ]?.label || "";


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div className="mx-auto max-w-7xl">

                {/* HEADER */}

                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                    <div>

                        <p className="text-[10px] font-semibold tracking-[0.24em] text-zinc-500">
                            MEME LAB ADMIN
                        </p>


                        <h1 className="mt-3 text-4xl font-bold tracking-tight text-black lg:text-5xl">
                            {greeting}, {firstName}.
                        </h1>


                        <p className="mt-3 text-sm text-zinc-500">
                            Here&apos;s what&apos;s happening across Meme Lab.
                        </p>

                    </div>


                    {/* TIME RANGE SELECTOR */}

                    <div className="flex flex-col items-start gap-2 lg:items-end">

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400">
                            TIME RANGE
                        </p>


                        <div className="flex items-center rounded-full border border-zinc-200 bg-white p-1">

                            {AVAILABLE_RANGES.map(
                                (range) => (

                                    <Link
                                        key={
                                            range
                                        }
                                        href={
                                            `/admin?days=${range}`
                                        }
                                        className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                                            dashboardDays ===
                                            range
                                                ? "bg-black text-white"
                                                : "text-zinc-500 hover:bg-zinc-100 hover:text-black"
                                        }`}
                                    >
                                        {range}D
                                    </Link>

                                )
                            )}

                        </div>


                        <p className="text-[11px] text-zinc-400">
                            {rangeStart} – {rangeEnd}
                        </p>

                    </div>

                </div>


                {/* SUMMARY CARDS */}

                <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            USERS
                        </p>


                        <p className="mt-4 text-4xl font-bold tracking-tight">
                            {totalUsers}
                        </p>


                        <p className="mt-3 text-sm text-zinc-500">
                            Registered profiles · All time
                        </p>

                    </div>


                    <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            MEMES
                        </p>


                        <p className="mt-4 text-4xl font-bold tracking-tight">
                            {totalMemes}
                        </p>


                        <p className="mt-3 text-sm text-zinc-500">
                            {recentGenerationCount} generated in past {dashboardDays} days
                        </p>

                    </div>


                    <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            VOTES
                        </p>


                        <p className="mt-4 text-4xl font-bold tracking-tight">
                            {totalVotes}
                        </p>


                        <p className="mt-3 text-sm text-zinc-500">
                            {recentVoteCount} cast in past {dashboardDays} days
                        </p>

                    </div>


                    <div className="rounded-3xl bg-black p-6 text-white">

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            RECENT SCORE
                        </p>


                        <p className="mt-4 text-4xl font-bold tracking-tight">
                            {recentCommunityScore >= 0
                                ? "+"
                                : ""}
                            {recentCommunityScore}
                        </p>


                        <p className="mt-3 text-sm text-zinc-400">
                            Past {dashboardDays} days · {recentFunnyPercentage}% Funny
                        </p>

                    </div>

                </div>


                {/* ACTIVITY TREND */}

                <div className="mt-5 rounded-3xl border border-zinc-200 bg-white p-6">

                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                        <div>

                            <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500">
                                ACTIVITY TREND
                            </p>


                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-black">
                                Past {dashboardDays} days
                            </h2>


                            <p className="mt-2 text-sm text-zinc-500">
                                Daily generations and community votes.
                            </p>

                        </div>


                        <div className="flex items-center gap-5 text-xs text-zinc-600">

                            <div className="flex items-center gap-2">

                                <span className="h-3 w-3 rounded-sm bg-black" />

                                <span>
                                    Memes
                                </span>

                            </div>


                            <div className="flex items-center gap-2">

                                <span className="h-3 w-3 rounded-sm bg-zinc-300" />

                                <span>
                                    Votes
                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="mt-8 overflow-x-auto">

                        <div
                            className={
                                dashboardDays === 30
                                    ? "min-w-[1000px]"
                                    : "min-w-[700px]"
                            }
                        >

                            <div className="flex h-64 items-end gap-2 border-b border-zinc-200 px-1">

                                {dailyActivity.map(
                                    (
                                        day,
                                        index
                                    ) =>
                                    {
                                        const generationHeight =
                                            day.generations > 0
                                                ? Math.max(
                                                    7,
                                                    (
                                                        day.generations /
                                                        maximumDailyActivity
                                                    ) * 100
                                                )
                                                : 0;


                                        const voteHeight =
                                            day.votes > 0
                                                ? Math.max(
                                                    7,
                                                    (
                                                        day.votes /
                                                        maximumDailyActivity
                                                    ) * 100
                                                )
                                                : 0;


                                        const showDateLabel =
                                            dashboardDays <= 14 ||
                                            index % 3 === 0 ||
                                            index ===
                                            dailyActivity.length - 1;


                                        return (
                                            <div
                                                key={
                                                    day.key
                                                }
                                                className="flex h-full min-w-0 flex-1 flex-col justify-end"
                                            >

                                                <div className="flex h-[210px] items-end justify-center gap-1">

                                                    <div
                                                        title={`${day.label}: ${day.generations} memes`}
                                                        className="w-[38%] rounded-t-md bg-black transition-all"
                                                        style={{
                                                            height:
                                                                `${generationHeight}%`,
                                                        }}
                                                    />


                                                    <div
                                                        title={`${day.label}: ${day.votes} votes`}
                                                        className="w-[38%] rounded-t-md bg-zinc-300 transition-all"
                                                        style={{
                                                            height:
                                                                `${voteHeight}%`,
                                                        }}
                                                    />

                                                </div>


                                                <p className="mt-3 min-h-[14px] truncate text-center text-[9px] font-medium text-zinc-500">

                                                    {showDateLabel
                                                        ? day.label
                                                        : ""}

                                                </p>

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </div>


                    <div className="mt-6 grid gap-4 md:grid-cols-3">

                        <div className="rounded-2xl bg-zinc-50 p-4">

                            <p className="text-xs text-zinc-500">
                                Memes generated
                            </p>


                            <p className="mt-1 text-2xl font-bold">
                                {recentGenerationCount}
                            </p>


                            <p className="mt-1 text-[11px] text-zinc-400">
                                Past {dashboardDays} days
                            </p>

                        </div>


                        <div className="rounded-2xl bg-zinc-50 p-4">

                            <p className="text-xs text-zinc-500">
                                Votes cast
                            </p>


                            <p className="mt-1 text-2xl font-bold">
                                {recentVoteCount}
                            </p>


                            <p className="mt-1 text-[11px] text-zinc-400">
                                Past {dashboardDays} days
                            </p>

                        </div>


                        <div className="rounded-2xl bg-zinc-50 p-4">

                            <p className="text-xs text-zinc-500">
                                Funny sentiment
                            </p>


                            <p className="mt-1 text-2xl font-bold">
                                {recentFunnyPercentage}%
                            </p>


                            <p className="mt-1 text-[11px] text-zinc-400">
                                {recentFunnyVotes} funny · {recentNotFunnyVotes} not funny
                            </p>

                        </div>

                    </div>

                </div>


                {/* TOP CONTENT + CREATOR */}

                <div className="mt-5 grid gap-5 xl:grid-cols-[2fr_1fr]">

                    <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                        <div>

                            <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500">
                                TOP CONTENT
                            </p>


                            <h2 className="mt-2 text-2xl font-bold tracking-tight">
                                Best performing memes
                            </h2>


                            <p className="mt-2 text-xs text-zinc-500">
                                Ranked by all-time community score.
                            </p>

                        </div>


                        {topMemes.length === 0 ? (

                            <div className="mt-8 rounded-2xl bg-zinc-50 p-8 text-center text-sm text-zinc-500">
                                No meme data yet.
                            </div>

                        ) : (

                            <div className="mt-7 grid gap-4 md:grid-cols-3">

                                {topMemes.map(
                                    (
                                        meme,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                meme
                                                    .generation
                                                    .id
                                            }
                                            className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
                                        >

                                            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200">

                                                {meme.generation.image_url ? (

                                                    <img
                                                        src={
                                                            meme
                                                                .generation
                                                                .image_url
                                                        }
                                                        alt={
                                                            meme
                                                                .generation
                                                                .caption ||
                                                            "Meme"
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />

                                                ) : (

                                                    <div className="grid h-full place-items-center text-sm text-zinc-500">
                                                        No image
                                                    </div>

                                                )}


                                                <div className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                                                    #{index + 1}
                                                </div>

                                            </div>


                                            <div className="p-4">

                                                <p className="line-clamp-2 min-h-[40px] text-sm font-semibold text-black">
                                                    {meme
                                                            .generation
                                                            .caption ||
                                                        "Untitled meme"}
                                                </p>


                                                <p className="mt-4 text-xs text-zinc-500">
                                                    {getProfileName(
                                                        meme
                                                            .generation
                                                            .user_id
                                                            ? profileMap.get(
                                                                meme
                                                                    .generation
                                                                    .user_id
                                                            )
                                                            : undefined
                                                    )}
                                                </p>


                                                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 text-xs">

                                                    <div className="flex gap-3">

                                                        <span>
                                                            ↑ {meme.positiveVotes}
                                                        </span>


                                                        <span>
                                                            ↓ {meme.negativeVotes}
                                                        </span>

                                                    </div>


                                                    <span className="font-semibold">
                                                        Score {meme.score}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                        <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500">
                            MOST ACTIVE CREATOR
                        </p>


                        {mostActiveCreator ? (

                            <div className="mt-7">

                                <div className="grid h-12 w-12 place-items-center rounded-full bg-black text-base font-semibold text-white">
                                    {(
                                        mostActiveCreator
                                            .first_name ||
                                        "U"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>


                                <h2 className="mt-5 text-2xl font-bold">
                                    {getProfileName(
                                        mostActiveCreator
                                    )}
                                </h2>


                                <p className="mt-2 text-sm text-zinc-500">
                                    {mostActiveCreatorCount} memes published
                                </p>

                            </div>

                        ) : (

                            <p className="mt-6 text-sm text-zinc-500">
                                No creator activity yet.
                            </p>

                        )}

                    </div>

                </div>


                {/* RECENT ACTIVITY */}

                <div className="mt-5 rounded-3xl border border-zinc-200 bg-white">

                    <div className="p-6">

                        <p className="text-[10px] font-semibold tracking-[0.2em] text-zinc-500">
                            RECENT ACTIVITY
                        </p>


                        <h2 className="mt-2 text-2xl font-bold tracking-tight">
                            Latest generations
                        </h2>

                    </div>


                    <div className="border-t border-zinc-100">

                        {recentGenerations.length === 0 ? (

                            <div className="p-8 text-sm text-zinc-500">
                                No generations yet.
                            </div>

                        ) : (

                            recentGenerations.map(
                                (
                                    generation,
                                    index
                                ) => (

                                    <div
                                        key={
                                            generation.id
                                        }
                                        className={`flex items-center gap-4 px-6 py-4 ${
                                            index !==
                                            recentGenerations.length -
                                            1
                                                ? "border-b border-zinc-100"
                                                : ""
                                        }`}
                                    >

                                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-200">

                                            {generation.image_url ? (

                                                <img
                                                    src={
                                                        generation.image_url
                                                    }
                                                    alt={
                                                        generation.caption ||
                                                        "Generation"
                                                    }
                                                    className="h-full w-full object-cover"
                                                />

                                            ) : null}

                                        </div>


                                        <div className="min-w-0 flex-1">

                                            <p className="truncate text-sm font-semibold text-black">
                                                {generation.caption ||
                                                    "Untitled generation"}
                                            </p>


                                            <p className="mt-1 text-xs text-zinc-500">
                                                {getProfileName(
                                                    generation.user_id
                                                        ? profileMap.get(
                                                            generation.user_id
                                                        )
                                                        : undefined
                                                )}
                                            </p>

                                        </div>


                                        <p className="shrink-0 text-xs text-zinc-400">
                                            {formatFullDate(
                                                generation.created_at
                                            )}
                                        </p>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>


                {/* ALL-TIME SCORE */}

                <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-6 py-4">

                    <div>

                        <p className="text-xs font-medium text-zinc-700">
                            All-time community score
                        </p>


                        <p className="mt-1 text-[11px] text-zinc-400">
                            Funny votes minus Not Funny votes across all history
                        </p>

                    </div>


                    <p className="text-lg font-bold text-black">
                        {allTimeCommunityScore >= 0
                            ? "+"
                            : ""}
                        {allTimeCommunityScore}
                    </p>

                </div>

            </div>

        </div>
    );
}