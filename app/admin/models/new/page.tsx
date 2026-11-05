import Link from "next/link";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { createModelAction } from "../actions";


type NewModelPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};


type Provider = {
    id: string;
    name: string;
    active: boolean;
};


export default async function NewModelPage({
                                               searchParams,
                                           }: NewModelPageProps) {
    const {
        supabase,
    } = await requireSuperadmin();


    const query =
        await searchParams;


    const {
        data,
        error,
    } =
        await supabase
            .from("llm_providers")
            .select(
                `
                id,
                name,
                active
                `
            )
            .order(
                "name",
                {
                    ascending: true,
                }
            );


    if (error) {
        console.error(
            "Could not load providers:",
            error
        );
    }


    const providers =
        (
            data ??
            []
        ) as Provider[];


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/models"
                className="text-sm font-medium text-zinc-600 transition hover:text-black"
            >
                ← Back to models
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    CREATE
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    New LLM model
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Add a language model and connect it to an LLM provider.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {query.error === "missing_fields"
                        ? "Provider, model name, and model key are required."
                        : "The model could not be created."}

                </div>
            )}


            {providers.length === 0 ? (
                <div className="mt-8 max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-7">

                    <p className="font-semibold text-amber-900">
                        No LLM providers available.
                    </p>


                    <p className="mt-2 text-sm text-amber-700">
                        Create a provider before adding a model.
                    </p>


                    <Link
                        href="/admin/providers/new"
                        className="mt-5 inline-flex h-10 items-center rounded-full bg-black px-5 text-sm font-semibold text-white"
                    >
                        Add provider
                    </Link>

                </div>
            ) : (
                <form
                    action={
                        createModelAction
                    }
                    className="mt-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7"
                >

                    <div>

                        <label
                            htmlFor="provider_id"
                            className="text-sm font-semibold text-zinc-900"
                        >
                            Provider
                        </label>


                        <select
                            id="provider_id"
                            name="provider_id"
                            required
                            defaultValue=""
                            className="mt-4 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-black"
                        >

                            <option
                                value=""
                                disabled
                            >
                                Select a provider
                            </option>


                            {providers.map(
                                (
                                    provider
                                ) => (
                                    <option
                                        key={
                                            provider.id
                                        }
                                        value={
                                            provider.id
                                        }
                                    >
                                        {provider.name}
                                        {!provider.active
                                            ? " (Inactive)"
                                            : ""}
                                    </option>
                                )
                            )}

                        </select>

                    </div>


                    <div className="mt-6">

                        <label
                            htmlFor="name"
                            className="text-sm font-semibold text-zinc-900"
                        >
                            Model name
                        </label>


                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="Example: GPT-5"
                            className="mt-4 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-black"
                        />

                    </div>


                    <div className="mt-6">

                        <label
                            htmlFor="model_key"
                            className="text-sm font-semibold text-zinc-900"
                        >
                            Model key
                        </label>


                        <p className="mt-1 text-xs text-zinc-400">
                            Identifier used when requesting this model from the provider.
                        </p>


                        <input
                            id="model_key"
                            name="model_key"
                            type="text"
                            required
                            placeholder="Example: gpt-5"
                            className="mt-4 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-black"
                        />

                    </div>


                    <div className="mt-6">

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-4">

                            <input
                                name="active"
                                type="checkbox"
                                defaultChecked
                                className="h-4 w-4"
                            />


                            <div>

                                <p className="text-sm font-semibold">
                                    Active
                                </p>


                                <p className="mt-1 text-xs text-zinc-400">
                                    Allow this model to be used by the application.
                                </p>

                            </div>

                        </label>

                    </div>


                    <div className="mt-8 flex gap-3">

                        <Link
                            href="/admin/models"
                            className="flex h-11 items-center justify-center rounded-full border border-zinc-200 px-6 text-sm font-semibold transition hover:bg-zinc-50"
                        >
                            Cancel
                        </Link>


                        <button
                            type="submit"
                            className="h-11 rounded-full bg-black px-7 text-sm font-semibold text-white transition hover:bg-zinc-800"
                        >
                            Create model
                        </button>

                    </div>

                </form>
            )}

        </div>
    );
}