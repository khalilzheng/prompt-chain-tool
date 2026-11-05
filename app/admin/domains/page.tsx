import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    deleteDomainAction,
} from "./actions";


type AllowedSignupDomain = {
    id: string;
    domain: string;
    active: boolean;
    created_at: string;
    updated_at: string;
};


type DomainsPageProps = {
    searchParams: Promise<{
        created?: string;
        updated?: string;
        deleted?: string;
        error?: string;
    }>;
};


function formatDate(
    value: string
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
            value
        )
    );
}


export default async function DomainsPage({
                                              searchParams,
                                          }: DomainsPageProps) {
    const params =
        await searchParams;


    const {
        supabase,
    } =
        await requireSuperadmin();


    const {
        data,
        error,
    } =
        await supabase
            .from(
                "allowed_signup_domains"
            )
            .select(
                `
                id,
                domain,
                active,
                created_at,
                updated_at
                `
            )
            .order(
                "domain",
                {
                    ascending: true,
                }
            );


    if (error) {
        console.error(
            "Could not load allowed signup domains:",
            error
        );
    }


    const domains =
        (
            data ??
            []
        ) as AllowedSignupDomain[];


    const activeCount =
        domains.filter(
            (
                domain
            ) =>
                domain.active
        ).length;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* HEADER */}

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        ACCESS CONTROL
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        Signup Domains
                    </h1>


                    <p className="mt-3 text-sm text-zinc-500">
                        Manage domains that are allowed to create Meme Lab accounts.
                    </p>

                </div>


                <Link
                    href="/admin/domains/new"
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    + Add domain
                </Link>

            </div>


            {/* STATUS MESSAGES */}

            {params.created ===
                "1" && (
                    <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
                        Signup domain created successfully.
                    </div>
                )}


            {params.updated ===
                "1" && (
                    <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
                        Signup domain updated successfully.
                    </div>
                )}


            {params.deleted ===
                "1" && (
                    <div className="mt-7 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-700">
                        Signup domain deleted.
                    </div>
                )}


            {params.error && (
                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    Something went wrong while managing this signup domain.
                </div>
            )}


            {/* STATS */}

            <div className="mt-8 grid gap-4 md:grid-cols-2">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        DOMAINS
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {
                            domains.length
                        }
                    </p>


                    <p className="mt-2 text-sm text-zinc-400">
                        Configured signup domains
                    </p>

                </div>


                <div className="rounded-3xl bg-black p-6 text-white">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        ACTIVE
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {
                            activeCount
                        }
                    </p>


                    <p className="mt-2 text-sm text-zinc-500">
                        Currently allowed
                    </p>

                </div>

            </div>


            {/* DIRECTORY */}

            <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-100 px-6 py-5">

                    <p className="font-semibold">
                        Domain directory
                    </p>


                    <p className="mt-1 text-sm text-zinc-400">
                        Create, review, update, or remove signup domains.
                    </p>

                </div>


                <div className="hidden grid-cols-[2fr_1fr_1.2fr_1.4fr] gap-5 border-b border-zinc-100 bg-zinc-50 px-6 py-3 text-[10px] font-semibold tracking-[0.14em] text-zinc-400 md:grid">

                    <div>
                        DOMAIN
                    </div>

                    <div>
                        STATUS
                    </div>

                    <div>
                        CREATED
                    </div>

                    <div>
                        ACTIONS
                    </div>

                </div>


                <div className="divide-y divide-zinc-100">

                    {domains.map(
                        (
                            domain
                        ) => (
                            <div
                                key={
                                    domain.id
                                }
                                className="grid gap-5 px-6 py-5 md:grid-cols-[2fr_1fr_1.2fr_1.4fr] md:items-center"
                            >

                                <div>

                                    <p className="font-semibold">
                                        {
                                            domain.domain
                                        }
                                    </p>


                                    <p className="mt-1 text-xs text-zinc-400">
                                        {
                                            domain.id
                                                .slice(
                                                    0,
                                                    8
                                                )
                                        }
                                        ...
                                    </p>

                                </div>


                                <div>

                                    {domain.active ? (
                                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
                                            Disabled
                                        </span>
                                    )}

                                </div>


                                <div className="text-sm text-zinc-500">
                                    {
                                        formatDate(
                                            domain.created_at
                                        )
                                    }
                                </div>


                                <div className="flex flex-wrap gap-2">

                                    <Link
                                        href={`/admin/domains/${domain.id}/edit`}
                                        className="inline-flex min-w-[96px] items-center justify-center rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold transition hover:bg-zinc-50"
                                    >
                                        Edit
                                    </Link>


                                    <form
                                        action={
                                            deleteDomainAction.bind(
                                                null,
                                                domain.id
                                            )
                                        }
                                    >

                                        <button
                                            type="submit"
                                            className="inline-flex min-w-[96px] items-center justify-center rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>

                                    </form>

                                </div>

                            </div>
                        )
                    )}


                    {domains.length ===
                        0 && (
                            <div className="px-8 py-20 text-center">

                                <p className="font-semibold">
                                    No signup domains found.
                                </p>


                                <p className="mt-2 text-sm text-zinc-400">
                                    Add a domain to control who can register.
                                </p>

                            </div>
                        )}

                </div>

            </div>

        </div>
    );
}