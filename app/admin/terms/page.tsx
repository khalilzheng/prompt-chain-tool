import Link from "next/link";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { deleteTermAction } from "./actions";


type TermsPageProps = {
    searchParams: Promise<{
        created?: string;
        updated?: string;
        deleted?: string;
        error?: string;
    }>;
};


type Term = {
    id: string;
    term: string;
    description: string | null;
    active: boolean;
    created_at: string;
};


export default async function TermsPage({
                                            searchParams,
                                        }: TermsPageProps) {
    const {
        supabase,
    } = await requireSuperadmin();


    const query =
        await searchParams;


    const {
        data,
        error,
    } =
        await supabase
            .from("terms")
            .select(
                `
                id,
                term,
                description,
                active,
                created_at
                `
            )
            .order(
                "term",
                {
                    ascending: true,
                }
            );


    if (error) {
        console.error(
            "Could not load terms:",
            error
        );
    }


    const terms =
        (
            data ??
            []
        ) as Term[];


    const activeCount =
        terms.filter(
            (
                term
            ) =>
                term.active
        ).length;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* HEADER */}

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        CONTENT
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        Terms
                    </h1>


                    <p className="mt-3 text-sm text-zinc-500">
                        Manage terms and references used by Meme Lab.
                    </p>

                </div>


                <Link
                    href="/admin/terms/new"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    + Add term
                </Link>

            </div>


            {/* MESSAGES */}

            {query.created === "1" && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
                    Term created successfully.
                </div>
            )}


            {query.updated === "1" && (
                <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
                    Term updated successfully.
                </div>
            )}


            {query.deleted === "1" && (
                <div className="mt-7 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium text-zinc-700">
                    Term deleted.
                </div>
            )}


            {query.error === "delete" && (
                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    The term could not be deleted.
                </div>
            )}


            {/* SUMMARY */}

            <div className="mt-8 grid gap-4 md:grid-cols-2">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        TOTAL TERMS
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {terms.length}
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        Terms in database
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-black p-6 text-white">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        ACTIVE
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {activeCount}
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                        Currently enabled
                    </p>

                </div>

            </div>


            {/* TABLE */}

            <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-100 px-6 py-5">

                    <p className="font-semibold">
                        All terms
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                        Create, review, update, and remove terms.
                    </p>

                </div>


                <div className="hidden grid-cols-[1fr_2fr_120px_220px] gap-5 border-b border-zinc-100 bg-zinc-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 md:grid">

                    <div>
                        Term
                    </div>

                    <div>
                        Description
                    </div>

                    <div>
                        Status
                    </div>

                    <div>
                        Actions
                    </div>

                </div>


                <div className="divide-y divide-zinc-100">

                    {terms.map(
                        (
                            item
                        ) => (
                            <div
                                key={
                                    item.id
                                }
                                className="grid gap-5 px-6 py-5 md:grid-cols-[1fr_2fr_120px_220px] md:items-center"
                            >

                                {/* TERM */}

                                <div>

                                    <p className="font-semibold text-zinc-950">
                                        {
                                            item.term
                                        }
                                    </p>

                                </div>


                                {/* DESCRIPTION */}

                                <div>

                                    <p className="text-sm leading-6 text-zinc-500">
                                        {item.description ||
                                            "No description"}
                                    </p>

                                </div>


                                {/* STATUS */}

                                <div>

                                    {item.active ? (
                                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
                                            Inactive
                                        </span>
                                    )}

                                </div>


                                {/* ACTIONS */}

                                <div className="flex gap-2">

                                    <Link
                                        href={`/admin/terms/${item.id}/edit`}
                                        className="flex h-10 flex-1 items-center justify-center rounded-full border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50"
                                    >
                                        Edit
                                    </Link>


                                    <form
                                        action={deleteTermAction.bind(
                                            null,
                                            item.id
                                        )}
                                        className="flex-1"
                                    >

                                        <button
                                            type="submit"
                                            className="h-10 w-full rounded-full border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>

                                    </form>

                                </div>

                            </div>
                        )
                    )}


                    {terms.length === 0 && (
                        <div className="px-8 py-20 text-center">

                            <p className="font-semibold">
                                No terms found.
                            </p>

                            <p className="mt-2 text-sm text-zinc-400">
                                Add your first term to begin managing terminology.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}