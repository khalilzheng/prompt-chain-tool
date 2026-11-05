import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";


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


export default async function PromptChainsPage() {
    const {
        supabase,
    } =
        await requireSuperadmin();


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
                ),
        ]);


    if (
        chainsResult.error
    ) {
        console.error(
            "Could not load prompt chains:",
            chainsResult.error
        );
    }


    if (
        stepsResult.error
    ) {
        console.error(
            "Could not load prompt chain steps:",
            stepsResult.error
        );
    }


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

            {/* HEADER */}

            <div>

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    PROMPTING
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                    Prompt Chains
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Review the prompt pipelines used by Meme Lab and inspect each step.
                </p>

            </div>


            {/* SUMMARY */}

            <div className="mt-8 grid gap-4 md:grid-cols-2">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        PROMPT CHAINS
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {chains.length}
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        Available pipelines
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        TOTAL STEPS
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {steps.length}
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        Steps across all chains
                    </p>

                </div>

            </div>


            {/* CHAINS */}

            <div className="mt-8 space-y-5">

                {chains.map(
                    (
                        chain
                    ) => {
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

                                {/* CHAIN HEADER */}

                                <div className="border-b border-zinc-100 p-6">

                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                        <div>

                                            <p className="text-xl font-semibold tracking-tight text-zinc-950">
                                                {
                                                    chain.name
                                                }
                                            </p>


                                            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                                                {chain.description ||
                                                    "No description provided."}
                                            </p>

                                        </div>


                                        <div className="shrink-0 rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-600">
                                            {
                                                chainSteps.length
                                            }{" "}
                                            {chainSteps.length ===
                                            1
                                                ? "step"
                                                : "steps"}
                                        </div>

                                    </div>

                                </div>


                                {/* STEPS */}

                                <div className="p-6">

                                    {chainSteps.length >
                                    0 ? (
                                        <div className="space-y-4">

                                            {chainSteps.map(
                                                (
                                                    step
                                                ) => (
                                                    <div
                                                        key={
                                                            step.id
                                                        }
                                                        className="flex gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5"
                                                    >

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
                                                )
                                            )}

                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-400">
                                            No steps are configured for this prompt chain.
                                        </p>
                                    )}

                                </div>

                            </section>
                        );
                    }
                )}


                {chains.length ===
                    0 && (
                        <div className="rounded-3xl border border-zinc-200 bg-white px-8 py-20 text-center">

                            <p className="text-lg font-semibold">
                                No prompt chains found.
                            </p>

                            <p className="mt-2 text-sm text-zinc-400">
                                Prompt chains will appear here when they are added to the database.
                            </p>

                        </div>
                    )}

            </div>

        </div>
    );
}