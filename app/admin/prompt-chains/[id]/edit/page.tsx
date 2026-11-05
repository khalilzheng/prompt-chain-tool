import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    updatePromptChainAction,
} from "../../actions";


type EditPromptChainPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


type PromptChain = {
    id: string;
    name: string;
    description: string | null;
};


export default async function EditPromptChainPage({
                                                      params,
                                                      searchParams,
                                                  }: EditPromptChainPageProps)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


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
            .from(
                "prompt_chains"
            )
            .select(
                `
                id,
                name,
                description
                `
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        error
    )
    {
        console.error(
            "Load prompt chain error:",
            error
        );


        notFound();
    }


    if (
        !data
    )
    {
        notFound();
    }


    const promptChain =
        data as PromptChain;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* BACK BUTTON */}

            <Link
                href="/admin/prompt-chains"
                className="text-sm font-medium text-zinc-600 transition hover:text-black"
            >
                ← Back to Prompt Chains
            </Link>


            {/* HEADER */}

            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    EDIT
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Edit Prompt Chain
                </h1>


                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Update the name or description for this prompt chain.
                </p>

            </div>


            {/* ERROR */}

            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {
                        query.error ===
                        "missing_name"
                            ? "A prompt chain name is required."
                            : query.error ===
                            "duplicate"
                                ? "Another prompt chain already uses this name."
                                : "The prompt chain could not be updated."
                    }

                </div>
            )}


            {/* EDIT FORM */}

            <form
                action={
                    updatePromptChainAction.bind(
                        null,
                        id
                    )
                }
                className="mt-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7"
            >

                {/* NAME */}

                <div>

                    <label
                        htmlFor="name"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Name
                    </label>


                    <p className="mt-1 text-xs text-zinc-400">
                        Update the name of this prompt chain.
                    </p>


                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        defaultValue={
                            promptChain.name
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


                    <p className="mt-1 text-xs text-zinc-400">
                        Update the description for this prompt chain.
                    </p>


                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        defaultValue={
                            promptChain.description ??
                            ""
                        }
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                {/* BUTTONS */}

                <div className="mt-8 flex flex-wrap gap-3">

                    <Link
                        href="/admin/prompt-chains"
                        className="flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold transition hover:bg-zinc-50"
                    >
                        Cancel
                    </Link>


                    <button
                        type="submit"
                        className="h-11 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Save Changes
                    </button>

                </div>

            </form>

        </div>
    );
}