import Link from "next/link";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { deleteExampleAction } from "./actions";


type ExamplesPageProps = {
    searchParams: Promise<{
        created?: string;
        updated?: string;
        deleted?: string;
        error?: string;
    }>;
};


type GenerationExample = {
    id: string;
    input_text: string;
    output_text: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
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
        new Date(value)
    );
}


export default async function ExamplesPage({
                                               searchParams,
                                           }: ExamplesPageProps) {
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
            .from("generation_examples")
            .select(
                `
                id,
                input_text,
                output_text,
                notes,
                created_at,
                updated_at
                `
            )
            .order(
                "created_at",
                {
                    ascending: false,
                }
            );


    if (error) {
        console.error(
            "Could not load generation examples:",
            error
        );
    }


    const examples =
        (
            data ??
            []
        ) as GenerationExample[];


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* HEADER */}

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        AI GENERATION
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        Generation Examples
                    </h1>


                    <p className="mt-3 text-sm text-zinc-500">
                        Manage example inputs and outputs used to demonstrate AI generation behavior.
                    </p>

                </div>


                <Link
                    href="/admin/examples/new"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    + Add example
                </Link>

            </div>


            {/* MESSAGES */}

            {query.created === "1" && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
                    Generation example created successfully.
                </div>
            )}


            {query.updated === "1" && (
                <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
                    Generation example updated successfully.
                </div>
            )}


            {query.deleted === "1" && (
                <div className="mt-7 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium text-zinc-700">
                    Generation example deleted.
                </div>
            )}


            {query.error === "delete" && (
                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    The generation example could not be deleted.
                </div>
            )}


            {/* SUMMARY */}

            <div className="mt-8">

                <div className="max-w-sm rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        TOTAL EXAMPLES
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {examples.length}
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        AI generation examples
                    </p>

                </div>

            </div>


            {/* EXAMPLES */}

            <div className="mt-8 space-y-4">

                {examples.map(
                    (
                        example
                    ) => (
                        <div
                            key={
                                example.id
                            }
                            className="rounded-3xl border border-zinc-200 bg-white p-6"
                        >

                            <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

                                <div className="grid min-w-0 flex-1 gap-5 lg:grid-cols-2">

                                    {/* INPUT */}

                                    <div>

                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                            Input
                                        </p>


                                        <p className="mt-3 text-sm leading-6 text-zinc-800">
                                            {
                                                example.input_text
                                            }
                                        </p>

                                    </div>


                                    {/* OUTPUT */}

                                    <div>

                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                            Expected Output
                                        </p>


                                        <p className="mt-3 text-sm font-medium leading-6 text-zinc-950">
                                            {
                                                example.output_text
                                            }
                                        </p>

                                    </div>

                                </div>


                                {/* ACTIONS */}

                                <div className="flex shrink-0 gap-2 lg:w-[220px]">

                                    <Link
                                        href={`/admin/examples/${example.id}/edit`}
                                        className="flex h-10 flex-1 items-center justify-center rounded-full border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50"
                                    >
                                        Edit
                                    </Link>


                                    <form
                                        action={deleteExampleAction.bind(
                                            null,
                                            example.id
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


                            {/* NOTES */}

                            {example.notes && (
                                <div className="mt-5 rounded-2xl bg-zinc-50 p-4">

                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                        Notes
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                                        {
                                            example.notes
                                        }
                                    </p>

                                </div>
                            )}


                            <p className="mt-5 text-xs text-zinc-400">
                                Created {formatDate(example.created_at)}
                            </p>

                        </div>
                    )
                )}


                {examples.length === 0 && (
                    <div className="rounded-3xl border border-zinc-200 bg-white px-8 py-20 text-center">

                        <p className="font-semibold">
                            No generation examples found.
                        </p>

                        <p className="mt-2 text-sm text-zinc-400">
                            Add an input and expected output to create the first example.
                        </p>

                    </div>
                )}

            </div>

        </div>
    );
}