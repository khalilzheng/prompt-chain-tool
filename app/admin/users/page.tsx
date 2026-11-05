/* eslint-disable @next/next/no-img-element */

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";


type ProfileRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    is_superadmin: boolean;
};


type GenerationRow = {
    id: string;
    user_id: string;
};


function getDisplayName(
    profile: ProfileRow
) {
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
    profile: ProfileRow
) {
    const name =
        getDisplayName(
            profile
        );

    return (
        name
            .charAt(0)
            .toUpperCase() ||
        "?"
    );
}


export default async function UsersPage() {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const [
        profilesResult,
        generationsResult,
    ] =
        await Promise.all([
            supabase
                .from(
                    "profiles"
                )
                .select(
                    `
                    id,
                    first_name,
                    last_name,
                    avatar_url,
                    is_superadmin
                    `
                )
                .order(
                    "first_name",
                    {
                        ascending: true,
                    }
                ),

            supabase
                .from(
                    "generations"
                )
                .select(
                    "id, user_id"
                ),
        ]);


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
     * Count posts belonging to each user.
     */
    const postCountMap =
        new Map<
            string,
            number
        >();


    for (
        const generation of generations
        ) {
        postCountMap.set(
            generation.user_id,

            (
                postCountMap.get(
                    generation.user_id
                ) ??
                0
            ) + 1
        );
    }


    const superadminCount =
        profiles.filter(
            (
                profile
            ) =>
                profile.is_superadmin
        ).length;


    const creatorsWithPosts =
        profiles.filter(
            (
                profile
            ) =>
                (
                    postCountMap.get(
                        profile.id
                    ) ??
                    0
                ) >
                0
        ).length;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* HEADER */}

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        PEOPLE
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        Users
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                        View the profiles currently connected to Meme Lab and see who is creating content.
                    </p>

                </div>


                <div className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-xs font-medium text-zinc-500">
                    {profiles.length} total profiles
                </div>

            </div>


            {/* SUMMARY */}

            <section className="mt-10 grid gap-4 md:grid-cols-3">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        TOTAL USERS
                    </p>

                    <p className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
                        {profiles.length}
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        Registered profiles
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        ACTIVE CREATORS
                    </p>

                    <p className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
                        {creatorsWithPosts}
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        Users with at least one meme
                    </p>

                </div>


                <div className="rounded-3xl bg-black p-6 text-white">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        SUPERADMINS
                    </p>

                    <p className="mt-5 text-4xl font-semibold tracking-[-0.04em]">
                        {superadminCount}
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                        Authorized admin accounts
                    </p>

                </div>

            </section>


            {/* USER TABLE */}

            <section className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-200 px-7 py-6">

                    <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                        PROFILE DIRECTORY
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        All users
                    </h2>

                </div>


                {profiles.length >
                0 ? (
                    <div className="overflow-x-auto">

                        <table className="w-full border-collapse">

                            <thead>

                            <tr className="border-b border-zinc-200 bg-zinc-50 text-left">

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    USER
                                </th>

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    USER ID
                                </th>

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    POSTS
                                </th>

                                <th className="px-7 py-4 text-[11px] font-semibold tracking-[0.12em] text-zinc-500">
                                    ACCESS
                                </th>

                            </tr>

                            </thead>


                            <tbody>

                            {profiles.map(
                                (
                                    profile
                                ) => {
                                    const displayName =
                                        getDisplayName(
                                            profile
                                        );


                                    const postCount =
                                        postCountMap.get(
                                            profile.id
                                        ) ??
                                        0;


                                    return (
                                        <tr
                                            key={
                                                profile.id
                                            }
                                            className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50 transition"
                                        >

                                            {/* USER */}

                                            <td className="px-7 py-5">

                                                <div className="flex items-center gap-4">

                                                    {profile.avatar_url ? (
                                                        <img
                                                            src={
                                                                profile.avatar_url
                                                            }
                                                            alt=""
                                                            className="h-11 w-11 rounded-full bg-zinc-100 object-cover"
                                                        />
                                                    ) : (
                                                        <div className="grid h-11 w-11 place-items-center rounded-full bg-black text-sm font-semibold text-white">
                                                            {getInitial(
                                                                profile
                                                            )}
                                                        </div>
                                                    )}


                                                    <div>

                                                        <p className="text-sm font-semibold text-zinc-900">
                                                            {displayName}
                                                        </p>

                                                        <p className="mt-1 text-xs text-zinc-400">
                                                            Meme Lab profile
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* ID */}

                                            <td className="px-7 py-5">

                                                <code className="rounded-lg bg-zinc-100 px-3 py-2 text-xs text-zinc-500">
                                                    {profile.id.slice(
                                                        0,
                                                        8
                                                    )}
                                                    …
                                                    {profile.id.slice(
                                                        -4
                                                    )}
                                                </code>

                                            </td>


                                            {/* POSTS */}

                                            <td className="px-7 py-5">

                                                <p className="text-sm font-semibold">
                                                    {postCount}
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-400">
                                                    {postCount ===
                                                    1
                                                        ? "meme"
                                                        : "memes"}
                                                </p>

                                            </td>


                                            {/* ADMIN */}

                                            <td className="px-7 py-5">

                                                {profile.is_superadmin ? (
                                                    <span className="inline-flex rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
                                                            Superadmin
                                                        </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-500">
                                                            User
                                                        </span>
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
                    <div className="px-7 py-14 text-center">

                        <p className="text-sm text-zinc-400">
                            No profiles found.
                        </p>

                    </div>
                )}

            </section>

        </div>
    );
}