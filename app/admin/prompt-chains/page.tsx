import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    deletePromptChainAction,
} from "./actions";


type PromptChain = {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
};


type PromptChainStep = {
    id: string;
    prompt_chain_id: string;
    step_order: number;
    name: string;
    prompt_template: string;
};


type PromptChainsPageProps = {
    searchParams: Promise<{
        created?: string;
        updated?: string;
        deleted?: string;
        error?: string;
    }>;
};


export default async function PromptChainsPage({
                                                   searchParams,
                                               }: PromptChainsPageProps)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const query =
        await searchParams;


    const [
        chainsResult,
        stepsResult,
    ] =
        await Promise.all([
            supabase
                .from(
                    "prompt_chains"
                )
                .select(
                    `
                    id,
                    name,
                    description,
                    created_at
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false,
                    }
                )
                .order(
                    "id",
                    {
                        ascending:
                            true,
                    }
                ),

            supabase
                .from(
                    "prompt_chain_steps"
                )
                .select(
                    `
                    id,
                    prompt_chain_id,
                    step_order,
                    name,
                    prompt_template
                    `
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
                ),
        ]);


    const chains =
        (
            chainsResult.data ??
            []
        ) as PromptChain[];


    const steps =
        (
            stepsResult.data ??
            []
        ) as PromptChainStep[];


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        PROMPTING
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        Prompt Chains
                    </h1>


                    <p className="mt-3 text-sm text-zinc-500">
                        Create and manage prompt chains and their individual steps.
                    </p>

                </div>


                <Link
                    href="/admin/prompt-chains/new"
                    className="flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white"
                >
                    + New Prompt Chain
                </Link>

            </div>


            {query.created && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                    Prompt chain created successfully.
                </div>
            )}


            {query.updated && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                    Prompt chain updated successfully.
                </div>
            )}


            {query.deleted && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-700">
                    Prompt chain deleted successfully.
                </div>
            )}


            <div className="mt-8 grid gap-4 md:grid-cols-2">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        PROMPT CHAINS
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {chains.length}
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        TOTAL STEPS
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {steps.length}
                    </p>

                </div>

            </div>


            <div className="mt-8 space-y-5">

                {chains.map(
                    (
                        chain
                    ) =>
                    {
                        const chainSteps =
                            steps.filter(
                                (
                                    step
                                ) =>
                                    step.prompt_chain_id ===
                                    chain.id
                            );


                        return (
                            <section
                                key={
                                    chain.id
                                }
                                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white"
                            >

                                <div className="border-b border-zinc-100 p-6">

                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                        <div>

                                            <div className="flex items-center gap-3">

                                                <p className="text-xl font-semibold">
                                                    {
                                                        chain.name
                                                    }
                                                </p>


                                                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                                                    {
                                                        chainSteps.length
                                                    }{" "}
                                                    {
                                                        chainSteps.length ===
                                                        1
                                                            ? "step"
                                                            : "steps"
                                                    }
                                                </span>

                                            </div>


                                            <p className="mt-2 text-sm text-zinc-500">
                                                {
                                                    chain.description ||
                                                    "No description provided."
                                                }
                                            </p>

                                        </div>


                                        <div className="flex flex-wrap gap-2">

                                            <Link
                                                href={
                                                    `/admin/prompt-chains/${chain.id}`
                                                }
                                                className="flex h-10 items-center rounded-full bg-black px-5 text-sm font-semibold text-white"
                                            >
                                                Manage Steps
                                            </Link>


                                            <Link
                                                href={
                                                    `/admin/prompt-chains/${chain.id}/edit`
                                                }
                                                className="flex h-10 items-center rounded-full border border-zinc-200 px-5 text-sm font-semibold"
                                            >
                                                Edit
                                            </Link>


                                            <form
                                                action={
                                                    deletePromptChainAction.bind(
                                                        null,
                                                        chain.id
                                                    )
                                                }
                                            >
                                                <button
                                                    type="submit"
                                                    className="h-10 rounded-full border border-red-200 px-5 text-sm font-semibold text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </form>

                                        </div>

                                    </div>

                                </div>


                                <div className="p-6">

                                    {chainSteps.length >
                                    0 ? (
                                        <div className="space-y-3">

                                            {chainSteps.map(
                                                (
                                                    step
                                                ) => (
                                                    <div
                                                        key={
                                                            step.id
                                                        }
                                                        className="flex gap-4 rounded-2xl bg-zinc-50 p-5"
                                                    >

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


                                                            <p className="mt-2 text-sm text-zinc-500">
                                                                {
                                                                    step.prompt_template
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-zinc-200 py-10 text-center">

                                            <p className="font-semibold">
                                                No steps yet
                                            </p>


                                            <p className="mt-2 text-sm text-zinc-400">
                                                Open Manage Steps to add the first step.
                                            </p>

                                        </div>
                                    )}

                                </div>

                            </section>
                        );
                    }
                )}

            </div>

        </div>
    );
}