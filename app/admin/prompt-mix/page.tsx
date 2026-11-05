import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    updatePromptMixAction,
} from "./actions";


type PromptMixPageProps = {
    searchParams: Promise<{
        updated?: string;
        error?: string;
    }>;
};


type PromptChain = {
    id: string;
    name: string;
    description: string | null;
};


type PromptMix = {
    id: string;
    prompt_chain_id: string;
    weight: number;
    enabled: boolean;
};


export default async function PromptMixPage({
                                                searchParams,
                                            }: PromptMixPageProps) {
    const {
        supabase,
    } =
        await requireSuperadmin();


    const query =
        await searchParams;


    const [
        chainsResult,
        mixResult,
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
                    description
                    `
                ),

            supabase
                .from(
                    "prompt_chain_mix"
                )
                .select(
                    `
                    id,
                    prompt_chain_id,
                    weight,
                    enabled
                    `
                )
                .order(
                    "weight",
                    {
                        ascending:
                            false,
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
        mixResult.error
    ) {
        console.error(
            "Could not load prompt mix:",
            mixResult.error
        );
    }


    const chains =
        (
            chainsResult.data ??
            []
        ) as PromptChain[];


    const mixRows =
        (
            mixResult.data ??
            []
        ) as PromptMix[];


    const chainMap =
        new Map(
            chains.map(
                (
                    chain
                ) => [
                    chain.id,
                    chain,
                ]
            )
        );


    const totalWeight =
        mixRows.reduce(
            (
                total,
                row
            ) =>
                total +
                Number(
                    row.weight
                ),
            0
        );


    const enabledCount =
        mixRows.filter(
            (
                row
            ) =>
                row.enabled
        ).length;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* HEADER */}

            <div>

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    PROMPTING
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                    Prompt Mix
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Control which prompt chains participate in generation and how heavily each chain is weighted.
                </p>

            </div>


            {/* STATUS */}

            {query.updated ===
                "1" && (
                    <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
                        Prompt mix updated successfully.
                    </div>
                )}


            {query.error ===
                "invalid_weight" && (
                    <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                        Weight must be between 0 and 1.
                    </div>
                )}


            {query.error ===
                "update" && (
                    <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                        The prompt mix could not be updated.
                    </div>
                )}


            {/* SUMMARY */}

            <div className="mt-8 grid gap-4 md:grid-cols-3">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        CHAINS
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {
                            mixRows.length
                        }
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        In prompt mix
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        ENABLED
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {
                            enabledCount
                        }
                    </p>

                    <p className="mt-2 text-sm text-zinc-400">
                        Active chains
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-black p-6 text-white">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        TOTAL WEIGHT
                    </p>

                    <p className="mt-4 text-4xl font-semibold">
                        {totalWeight.toFixed(
                            3
                        )}
                    </p>

                    <p className="mt-2 text-sm text-zinc-500">
                        Across all chains
                    </p>

                </div>

            </div>


            {/* MIX TABLE */}

            <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-100 px-6 py-5">

                    <p className="font-semibold">
                        Prompt chain mix
                    </p>

                    <p className="mt-1 text-sm text-zinc-400">
                        Update weights or enable and disable individual chains.
                    </p>

                </div>


                <div className="divide-y divide-zinc-100">

                    {mixRows.map(
                        (
                            row
                        ) => {
                            const chain =
                                chainMap.get(
                                    row.prompt_chain_id
                                );


                            return (
                                <form
                                    key={
                                        row.id
                                    }
                                    action={updatePromptMixAction.bind(
                                        null,
                                        row.id
                                    )}
                                    className="grid gap-5 px-6 py-6 lg:grid-cols-[1fr_180px_160px_120px] lg:items-center"
                                >

                                    {/* CHAIN */}

                                    <div>

                                        <p className="font-semibold text-zinc-900">
                                            {chain?.name ||
                                                "Unknown chain"}
                                        </p>


                                        <p className="mt-1 text-sm text-zinc-400">
                                            {chain?.description ||
                                                "No description"}
                                        </p>

                                    </div>


                                    {/* WEIGHT */}

                                    <div>

                                        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                            Weight
                                        </label>


                                        <input
                                            name="weight"
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.001"
                                            defaultValue={
                                                row.weight
                                            }
                                            required
                                            className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-black"
                                        />

                                    </div>


                                    {/* ENABLED */}

                                    <div>

                                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                                            Status
                                        </p>


                                        <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-4">

                                            <input
                                                name="enabled"
                                                type="checkbox"
                                                defaultChecked={
                                                    row.enabled
                                                }
                                                className="h-4 w-4"
                                            />

                                            <span className="text-sm font-medium text-zinc-700">
                                                Enabled
                                            </span>

                                        </label>

                                    </div>


                                    {/* SAVE */}

                                    <div className="lg:pt-5">

                                        <button
                                            type="submit"
                                            className="h-11 w-full rounded-full bg-black px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                                        >
                                            Save
                                        </button>

                                    </div>

                                </form>
                            );
                        }
                    )}


                    {mixRows.length ===
                        0 && (
                            <div className="px-8 py-20 text-center">

                                <p className="font-semibold">
                                    No prompt mix found.
                                </p>

                                <p className="mt-2 text-sm text-zinc-400">
                                    Add prompt chains to the mix to manage them here.
                                </p>

                            </div>
                        )}

                </div>

            </div>

        </div>
    );
}