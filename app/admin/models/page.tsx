import Link from "next/link";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { deleteModelAction } from "./actions";


type ModelsPageProps = {
    searchParams: Promise<{
        created?: string;
        updated?: string;
        deleted?: string;
        error?: string;
    }>;
};


type Model = {
    id: string;
    provider_id: string;
    name: string;
    model_key: string;
    active: boolean;
    created_at: string;
};


type Provider = {
    id: string;
    name: string;
};


export default async function ModelsPage({
                                             searchParams,
                                         }: ModelsPageProps) {
    const {
        supabase,
    } = await requireSuperadmin();


    const query =
        await searchParams;


    const [
        modelsResult,
        providersResult,
    ] =
        await Promise.all([
            supabase
                .from("llm_models")
                .select(
                    `
                    id,
                    provider_id,
                    name,
                    model_key,
                    active,
                    created_at
                    `
                )
                .order(
                    "name",
                    {
                        ascending: true,
                    }
                ),

            supabase
                .from("llm_providers")
                .select(
                    `
                    id,
                    name
                    `
                ),
        ]);


    if (modelsResult.error) {
        console.error(
            "Could not load LLM models:",
            modelsResult.error
        );
    }


    if (providersResult.error) {
        console.error(
            "Could not load LLM providers:",
            providersResult.error
        );
    }


    const models =
        (
            modelsResult.data ??
            []
        ) as Model[];


    const providers =
        (
            providersResult.data ??
            []
        ) as Provider[];


    const providerNames =
        new Map(
            providers.map(
                (
                    provider
                ) => [
                    provider.id,
                    provider.name,
                ]
            )
        );


    const activeCount =
        models.filter(
            (
                model
            ) =>
                model.active
        ).length;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        AI CONFIGURATION
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        LLM Models
                    </h1>


                    <p className="mt-3 text-sm text-zinc-500">
                        Manage the language models available to Meme Lab.
                    </p>

                </div>


                <Link
                    href="/admin/models/new"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    + Add model
                </Link>

            </div>


            {query.created === "1" && (
                <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800">
                    Model created successfully.
                </div>
            )}


            {query.updated === "1" && (
                <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-800">
                    Model updated successfully.
                </div>
            )}


            {query.deleted === "1" && (
                <div className="mt-7 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-medium text-zinc-700">
                    Model deleted.
                </div>
            )}


            {query.error === "in_use" && (
                <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800">
                    This model cannot be deleted because existing LLM responses are using it.
                </div>
            )}


            {query.error === "delete" && (
                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                    The model could not be deleted.
                </div>
            )}


            <div className="mt-8 grid gap-4 md:grid-cols-2">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        MODELS
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {models.length}
                    </p>


                    <p className="mt-2 text-sm text-zinc-400">
                        Configured models
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-black p-6 text-white">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        ACTIVE
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {activeCount}
                    </p>


                    <p className="mt-2 text-sm text-zinc-500">
                        Currently enabled
                    </p>

                </div>

            </div>


            <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-100 px-6 py-5">

                    <p className="font-semibold">
                        Model directory
                    </p>


                    <p className="mt-1 text-sm text-zinc-400">
                        Configure providers, model identifiers, and availability.
                    </p>

                </div>


                <div className="hidden grid-cols-[1fr_1fr_1fr_110px_220px] gap-5 border-b border-zinc-100 bg-zinc-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 md:grid">

                    <div>
                        Model
                    </div>

                    <div>
                        Provider
                    </div>

                    <div>
                        Model Key
                    </div>

                    <div>
                        Status
                    </div>

                    <div>
                        Actions
                    </div>

                </div>


                <div className="divide-y divide-zinc-100">

                    {models.map(
                        (
                            model
                        ) => (
                            <div
                                key={
                                    model.id
                                }
                                className="grid gap-5 px-6 py-5 md:grid-cols-[1fr_1fr_1fr_110px_220px] md:items-center"
                            >

                                <div>

                                    <p className="font-semibold text-zinc-950">
                                        {
                                            model.name
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm text-zinc-500">
                                        {
                                            providerNames.get(
                                                model.provider_id
                                            ) ??
                                            "Unknown provider"
                                        }
                                    </p>

                                </div>


                                <div>

                                    <code className="rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs text-zinc-700">
                                        {
                                            model.model_key
                                        }
                                    </code>

                                </div>


                                <div>

                                    {model.active ? (
                                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500">
                                            Inactive
                                        </span>
                                    )}

                                </div>


                                <div className="flex gap-2">

                                    <Link
                                        href={`/admin/models/${model.id}/edit`}
                                        className="flex h-10 flex-1 items-center justify-center rounded-full border border-zinc-200 text-sm font-semibold transition hover:bg-zinc-50"
                                    >
                                        Edit
                                    </Link>


                                    <form
                                        action={deleteModelAction.bind(
                                            null,
                                            model.id
                                        )}
                                        className="flex-1"
                                    >

                                        <button
                                            type="submit"
                                            className="h-10 w-full rounded-full border border-red-200 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>

                                    </form>

                                </div>

                            </div>
                        )
                    )}


                    {models.length === 0 && (
                        <div className="px-8 py-20 text-center">

                            <p className="font-semibold">
                                No models found.
                            </p>


                            <p className="mt-2 text-sm text-zinc-400">
                                Add an LLM model to begin.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}