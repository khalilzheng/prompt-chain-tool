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


    const {
        data:
            chain,
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
        !chain
    )
    {
        notFound();
    }


    const {
        data:
            steps,
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
        steps ??
        [];


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/prompt-chains"
                className="text-sm font-medium text-zinc-600"
            >
                ← Back to Prompt Chains
            </Link>


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


                    <p className="mt-3 text-sm text-zinc-500">
                        {
                            chain.description ||
                            "No description provided."
                        }
                    </p>

                </div>


                <Link
                    href={
                        `/admin/prompt-chains/${id}/steps/new`
                    }
                    className="flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
                >
                    + Add Step
                </Link>

            </div>


            {query.created && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                    Step created successfully.
                </div>
            )}


            {query.updated && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                    Step updated successfully.
                </div>
            )}


            {query.deleted && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                    Step deleted successfully.
                </div>
            )}


            {query.reordered && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                    Step order updated successfully.
                </div>
            )}


            <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-7">

                <div className="flex items-center justify-between">

                    <div>

                        <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                            STEPS
                        </p>


                        <p className="mt-3 text-3xl font-semibold">
                            {
                                chainSteps.length
                            }
                        </p>

                    </div>

                </div>


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

                                    <div className="flex gap-4">

                                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-sm font-semibold text-white">
                                            {
                                                step.step_order
                                            }
                                        </div>


                                        <div>

                                            <p className="font-semibold">
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


                                    <div className="flex flex-wrap gap-2">

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
                                                className="h-9 rounded-full border border-zinc-200 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                ↑
                                            </button>

                                        </form>


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
                                                className="h-9 rounded-full border border-zinc-200 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-30"
                                            >
                                                ↓
                                            </button>

                                        </form>


                                        <Link
                                            href={
                                                `/admin/prompt-chains/${id}/steps/${step.id}/edit`
                                            }
                                            className="flex h-9 items-center rounded-full border border-zinc-200 px-4 text-sm font-semibold"
                                        >
                                            Edit
                                        </Link>


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
                                                className="h-9 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600"
                                            >
                                                Delete
                                            </button>

                                        </form>

                                    </div>

                                </div>

                            </div>
                        )
                    )}


                    {chainSteps.length ===
                        0 && (
                            <div className="rounded-2xl border border-dashed border-zinc-200 py-14 text-center">

                                <p className="font-semibold">
                                    No steps yet.
                                </p>


                                <p className="mt-2 text-sm text-zinc-400">
                                    Add the first step to start building this prompt chain.
                                </p>

                            </div>
                        )}

                </div>

            </div>

        </div>
    );
}