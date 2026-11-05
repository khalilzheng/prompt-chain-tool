import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import RunPromptChainClient from "./RunPromptChainClient";


type RunPromptChainPageProps = {
    params: Promise<{
        id: string;
    }>;
};


export default async function RunPromptChainPage({
                                                     params,
                                                 }: RunPromptChainPageProps)
{
    const {
        supabase,
    } =
        await requireSuperadmin();


    const {
        id,
    } =
        await params;


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
            stepRows,
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
            );


    const {
        data:
            imageRows,
    } =
        await supabase
            .from(
                "images"
            )
            .select(
                `
                id,
                image_url,
                alt_text,
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
            .limit(
                24
            );


    const {
        data:
            generationRows,
    } =
        await supabase
            .from(
                "generations"
            )
            .select(
                `
                id,
                created_at,
                image_url,
                prompt,
                caption,
                prompt_chain_id
                `
            )
            .eq(
                "prompt_chain_id",
                id
            )
            .order(
                "created_at",
                {
                    ascending:
                        false,
                }
            )
            .limit(
                20
            );


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href={
                    `/admin/prompt-chains/${id}`
                }
                className="text-sm font-medium text-zinc-600"
            >
                ← Back to Prompt Chain
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    RUN PROMPT CHAIN
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    {
                        chain.name
                    }
                </h1>


                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                    Select an image and run every prompt-chain step in order.
                </p>

            </div>


            <RunPromptChainClient
                promptChainId={
                    chain.id
                }

                promptChainName={
                    chain.name
                }

                steps={
                    stepRows ??
                    []
                }

                images={
                    imageRows ??
                    []
                }

                initialGenerations={
                    generationRows ??
                    []
                }
            />

        </div>
    );
}