import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    deletePromptChainStepAction,
    movePromptChainStepAction,
} from "../actions";


type PromptChainPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        created?: string;
        updated?: string;
        deleted?: string;
        reordered?: string;
        error?: string;
    }>;
};


type PromptChain = {
    id: string;
    name: string;
    description: string | null;
};


type PromptChainStep = {
    id: string;
    step_order: number;
    name: string;
    prompt_template: string;
};


export default async function PromptChainPage({
                                                  params,
                                                  searchParams,
                                              }: PromptChainPageProps)
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


    /*
     * Load the selected prompt chain.
     */
    const {
        data:
            chainData,

        error:
            chainError,
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
        chainError ||
        !chainData
    )
    {
        notFound();
    }


    const chain =
        chainData as PromptChain;


    /*
     * Load all steps for this prompt chain.
     */
    const {
        data:
            stepData,

        error:
            stepsError,
    } =
        await supabase
            .from(
                "prompt_chain_steps"
            )
            .select(
                `
                id,
                step_order,
                name,
                prompt_template
                `
            )
            .eq(
                "prompt_chain_id",
                id
            )
            .order(
                "step_order",
                {
                    ascending:
                        true,
                }
            )
            .order(
                "id",
                {
                    ascending:
                        true,
                }
            );


    if (
        stepsError
    )
    {
        console.error(
            "Could not load prompt chain steps:",
            stepsError
        );
    }


    const chainSteps =
        (
            stepData ??
            []
        ) as PromptChainStep[];


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* BACK */}

            <Link
                href="/admin/prompt-chains"
                className="text-sm font-medium text-zinc-600 transition hover:text-black"
            >
                ← Back to Prompt Chains
            </Link>


            {/* HEADER */}

            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        PROMPT CHAIN
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                        {
                            chain.name
                        }
                    </h1>


                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                        {
                            chain.description ||
                            "No description provided."
                        }
                    </p>

                </div>


                {/* HEADER ACTIONS */}

                <div className="flex flex-wrap gap-3">

                    <Link
                        href={
                            `/admin/prompt-chains/${id}/run`
                        }
                        className="flex h-11 items-center justify-center rounded-full border border-black bg-white px-6 text-sm font-semibold text-black transition hover:bg-zinc-100"
                    >
                        Run Prompt Chain
                    </Link>


                    <Link
                        href={
                            `/admin/prompt-chains/${id}/steps/new`
                        }
                        className="flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        + Add Step
                    </Link>

                </div>

            </div>


            {/* SUCCESS MESSAGES */}

            {query.created && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                    Step created successfully.
                </div>
            )}


            {query.updated && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                    Step updated successfully.
                </div>
            )}


            {query.deleted && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                    Step deleted successfully.
                </div>
            )}


            {query.reordered && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                    Step order updated successfully.
                </div>
            )}


            {query.error && (
                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {
                        query.error ===
                        "delete"
                            ? "The step could not be deleted."
                            : query.error ===
                            "reorder"
                                ? "The step order could not be updated."
                                : "Something went wrong."
                    }

                </div>
            )}


            {/* STEP SUMMARY */}

            <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-7">

                <div className="flex items-center justify-between gap-4">

                    <div>

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            STEPS
                        </p>


                        <p className="mt-3 text-3xl font-semibold">
                            {
                                chainSteps.length
                            }
                        </p>


                        <p className="mt-2 text-sm text-zinc-400">
                            Steps in this prompt chain
                        </p>

                    </div>


                    {chainSteps.length >
                        0 && (
                            <Link
                                href={
                                    `/admin/prompt-chains/${id}/run`
                                }
                                className="text-sm font-semibold text-zinc-600 transition hover:text-black"
                            >
                                Test this chain →
                            </Link>
                        )}

                </div>


                {/* STEPS */}

                <div className="mt-7 space-y-4">

                    {chainSteps.map(
                        (
                            step,
                            currentIndex
                        ) => (
                            <div
                                key={
                                    step.id
                                }
                                className="rounded-2xl border border-zinc-200 p-5"
                            >

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                    {/* STEP INFORMATION */}

                                    <div className="flex min-w-0 gap-4">

                                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-sm font-semibold text-white">
                                            {
                                                step.step_order
                                            }
                                        </div>


                                        <div className="min-w-0">

                                            <p className="font-semibold text-zinc-900">
                                                {
                                                    step.name
                                                }
                                            </p>


                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-500">
                                                {
                                                    step.prompt_template
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {/* STEP ACTIONS */}

                                    <div className="flex shrink-0 flex-wrap gap-2">

                                        {/* MOVE UP */}

                                        <form
                                            action={
                                                movePromptChainStepAction.bind(
                                                    null,
                                                    id,
                                                    step.id,
                                                    "up"
                                                )
                                            }
                                        >

                                            <button
                                                type="submit"
                                                disabled={
                                                    currentIndex ===
                                                    0
                                                }
                                                title="Move step up"
                                                className="h-9 rounded-full border border-zinc-200 px-4 text-sm font-semibold transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                ↑
                                            </button>

                                        </form>


                                        {/* MOVE DOWN */}

                                        <form
                                            action={
                                                movePromptChainStepAction.bind(
                                                    null,
                                                    id,
                                                    step.id,
                                                    "down"
                                                )
                                            }
                                        >

                                            <button
                                                type="submit"
                                                disabled={
                                                    currentIndex ===
                                                    chainSteps.length -
                                                    1
                                                }
                                                title="Move step down"
                                                className="h-9 rounded-full border border-zinc-200 px-4 text-sm font-semibold transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                ↓
                                            </button>

                                        </form>


                                        {/* EDIT */}

                                        <Link
                                            href={
                                                `/admin/prompt-chains/${id}/steps/${step.id}/edit`
                                            }
                                            className="flex h-9 items-center rounded-full border border-zinc-200 px-4 text-sm font-semibold transition hover:bg-zinc-50"
                                        >
                                            Edit
                                        </Link>


                                        {/* DELETE */}

                                        <form
                                            action={
                                                deletePromptChainStepAction.bind(
                                                    null,
                                                    id,
                                                    step.id
                                                )
                                            }
                                        >

                                            <button
                                                type="submit"
                                                className="h-9 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                            >
                                                Delete
                                            </button>

                                        </form>

                                    </div>

                                </div>

                            </div>
                        )
                    )}


                    {/* EMPTY STATE */}

                    {chainSteps.length ===
                        0 && (
                            <div className="rounded-2xl border border-dashed border-zinc-200 px-6 py-14 text-center">

                                <p className="font-semibold text-zinc-800">
                                    No steps yet.
                                </p>


                                <p className="mt-2 text-sm text-zinc-400">
                                    Add the first step to start building this prompt chain.
                                </p>


                                <Link
                                    href={
                                        `/admin/prompt-chains/${id}/steps/new`
                                    }
                                    className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
                                >
                                    + Add First Step
                                </Link>

                            </div>
                        )}

                </div>

            </section>


            {/* RUN EXPLANATION */}

            {chainSteps.length >
                0 && (
                    <section className="mt-6 rounded-3xl border border-zinc-200 bg-white p-7">

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            TEST THIS CHAIN
                        </p>


                        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                            <div>

                                <h2 className="text-xl font-semibold">
                                    Run all steps in order
                                </h2>


                                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                                    Choose an image, run each prompt step, and review the final generated result.
                                </p>

                            </div>


                            <Link
                                href={
                                    `/admin/prompt-chains/${id}/run`
                                }
                                className="flex h-11 shrink-0 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                Run Prompt Chain
                            </Link>

                        </div>

                    </section>
                )}

        </div>
    );
}