import Link from "next/link";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { createExampleAction } from "../actions";


type NewExamplePageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};


export default async function NewExamplePage({
                                                 searchParams,
                                             }: NewExamplePageProps) {
    await requireSuperadmin();


    const query =
        await searchParams;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/examples"
                className="text-sm font-medium text-zinc-600 transition hover:text-black"
            >
                ← Back to examples
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    CREATE
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    New generation example
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Add an example input and expected AI-generated output.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {query.error === "missing_fields"
                        ? "Input text and output text are required."
                        : "The generation example could not be created."}

                </div>
            )}


            <form
                action={
                    createExampleAction
                }
                className="mt-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7"
            >

                {/* INPUT */}

                <div>

                    <label
                        htmlFor="input_text"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Input text
                    </label>


                    <p className="mt-1 text-xs text-zinc-400">
                        The situation or prompt provided to the AI.
                    </p>


                    <textarea
                        id="input_text"
                        name="input_text"
                        rows={5}
                        required
                        placeholder="Example: Student realizes the assignment is due in five minutes."
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                {/* OUTPUT */}

                <div className="mt-6">

                    <label
                        htmlFor="output_text"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Output text
                    </label>


                    <p className="mt-1 text-xs text-zinc-400">
                        The example caption or response the AI should produce.
                    </p>


                    <textarea
                        id="output_text"
                        name="output_text"
                        rows={5}
                        required
                        placeholder="Example: When Canvas crashes five minutes before the deadline."
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                {/* NOTES */}

                <div className="mt-6">

                    <label
                        htmlFor="notes"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Notes
                    </label>


                    <p className="mt-1 text-xs text-zinc-400">
                        Optional notes about why this is a useful example.
                    </p>


                    <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        placeholder="Optional notes..."
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                <div className="mt-8 flex gap-3">

                    <Link
                        href="/admin/examples"
                        className="flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold transition hover:bg-zinc-50"
                    >
                        Cancel
                    </Link>


                    <button
                        type="submit"
                        className="h-11 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Create example
                    </button>

                </div>

            </form>

        </div>
    );
}