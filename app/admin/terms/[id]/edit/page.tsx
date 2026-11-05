import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { updateTermAction } from "../../actions";


type EditTermPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


type Term = {
    id: string;
    term: string;
    description: string | null;
    active: boolean;
};


export default async function EditTermPage({
                                               params,
                                               searchParams,
                                           }: EditTermPageProps) {
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        id,
    } =
        await params;


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
                active
                `
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        error ||
        !data
    ) {
        notFound();
    }


    const term =
        data as Term;


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
                    EDIT
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Edit term
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Update this term and its status.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {query.error ===
                    "missing_term"
                        ? "A term is required."
                        : query.error ===
                        "duplicate"
                            ? "Another term already uses that name."
                            : "The term could not be updated."}

                </div>
            )}


            <form
                action={updateTermAction.bind(
                    null,
                    id
                )}
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


                    <input
                        id="term"
                        name="term"
                        type="text"
                        required
                        defaultValue={
                            term.term
                        }
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


                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        defaultValue={
                            term.description ??
                            ""
                        }
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                {/* ACTIVE */}

                <div className="mt-6">

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-4">

                        <input
                            name="active"
                            type="checkbox"
                            defaultChecked={
                                term.active
                            }
                            className="h-4 w-4"
                        />

                        <div>

                            <p className="text-sm font-semibold text-zinc-900">
                                Active
                            </p>

                            <p className="mt-1 text-xs text-zinc-400">
                                Enable or disable this term.
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
                        Save changes
                    </button>

                </div>

            </form>

        </div>
    );
}