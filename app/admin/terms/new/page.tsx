import Link from "next/link";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { createTermAction } from "../actions";


type NewTermPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};


export default async function NewTermPage({
                                              searchParams,
                                          }: NewTermPageProps) {
    await requireSuperadmin();


    const query =
        await searchParams;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/terms"
                className="text-sm font-medium text-zinc-600 transition hover:text-black"
            >
                ← Back to terms
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    CREATE
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    New term
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Add a new term or reference to Meme Lab.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {query.error ===
                    "missing_term"
                        ? "A term is required."
                        : query.error ===
                        "duplicate"
                            ? "That term already exists."
                            : "The term could not be created."}

                </div>
            )}


            <form
                action={
                    createTermAction
                }
                className="mt-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7"
            >

                {/* TERM */}

                <div>

                    <label
                        htmlFor="term"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Term
                    </label>


                    <p className="mt-1 text-xs text-zinc-400">
                        The word, phrase, or reference.
                    </p>


                    <input
                        id="term"
                        name="term"
                        type="text"
                        required
                        placeholder="Example: Midterm"
                        className="mt-4 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                {/* DESCRIPTION */}

                <div className="mt-6">

                    <label
                        htmlFor="description"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Description
                    </label>


                    <p className="mt-1 text-xs text-zinc-400">
                        Explain what this term refers to.
                    </p>


                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        placeholder="Describe this term..."
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                {/* ACTIVE */}

                <div className="mt-6">

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-4">

                        <input
                            name="active"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4"
                        />

                        <div>

                            <p className="text-sm font-semibold text-zinc-900">
                                Active
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                                Make this term available immediately.
                            </p>

                        </div>

                    </label>

                </div>


                {/* BUTTONS */}

                <div className="mt-8 flex gap-3">

                    <Link
                        href="/admin/terms"
                        className="flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold transition hover:bg-zinc-50"
                    >
                        Cancel
                    </Link>


                    <button
                        type="submit"
                        className="h-11 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Create term
                    </button>

                </div>

            </form>

        </div>
    );
}