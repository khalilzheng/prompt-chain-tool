import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { updateModelAction } from "../../actions";


type EditModelPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


type Model = {
    id: string;
    provider_id: string;
    name: string;
    model_key: string;
    active: boolean;
};


type Provider = {
    id: string;
    name: string;
    active: boolean;
};


export default async function EditModelPage({
                                                params,
                                                searchParams,
                                            }: EditModelPageProps) {
    const {
        supabase,
    } = await requireSuperadmin();


    const {
        id,
    } =
        await params;


    const query =
        await searchParams;


    const [
        modelResult,
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
                    active
                    `
                )
                .eq(
                    "id",
                    id
                )
                .maybeSingle(),

            supabase
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
                ),
        ]);


    if (
        modelResult.error ||
        !modelResult.data
    ) {
        notFound();
    }


    if (providersResult.error) {
        console.error(
            "Could not load providers:",
            providersResult.error
        );
    }


    const model =
        modelResult.data as Model;


    const providers =
        (
            providersResult.data ??
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
                    EDIT
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Edit LLM model
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Update the model configuration and provider association.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {query.error === "missing_fields"
                        ? "Provider, model name, and model key are required."
                        : "The model could not be updated."}

                </div>
            )}


            <form
                action={updateModelAction.bind(
                    null,
                    id
                )}
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
                        defaultValue={
                            model.provider_id
                        }
                        className="mt-4 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-black"
                    >

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
                        defaultValue={
                            model.name
                        }
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


                    <input
                        id="model_key"
                        name="model_key"
                        type="text"
                        required
                        defaultValue={
                            model.model_key
                        }
                        className="mt-4 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                <div className="mt-6">

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-4">

                        <input
                            name="active"
                            type="checkbox"
                            defaultChecked={
                                model.active
                            }
                            className="h-4 w-4"
                        />


                        <div>

                            <p className="text-sm font-semibold">
                                Active
                            </p>


                            <p className="mt-1 text-xs text-zinc-400">
                                Enable or disable this model.
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
                        Save changes
                    </button>

                </div>

            </form>

        </div>
    );
}