import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";

import { updateProviderAction } from "../../actions";


type EditProviderPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


type Provider = {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
};


export default async function EditProviderPage({
                                                   params,
                                                   searchParams,
                                               }: EditProviderPageProps) {
    const {
        supabase,
    } = await requireSuperadmin();


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
            .from("llm_providers")
            .select(
                `
                id,
                name,
                description,
                active
                `
            )
            .eq(
                "id",
                id
            )
            .maybeSingle();


    if (
        error ||
        !data
    ) {
        notFound();
    }


    const provider =
        data as Provider;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/providers"
                className="text-sm font-medium text-zinc-600 transition hover:text-black"
            >
                ← Back to providers
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    EDIT
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Edit LLM provider
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Update this provider and its availability.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">

                    {query.error === "missing_name"
                        ? "Provider name is required."
                        : "The provider could not be updated."}

                </div>
            )}


            <form
                action={updateProviderAction.bind(
                    null,
                    id
                )}
                className="mt-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7"
            >

                <div>

                    <label
                        htmlFor="name"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Provider name
                    </label>


                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        defaultValue={
                            provider.name
                        }
                        className="mt-4 h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                <div className="mt-6">

                    <label
                        htmlFor="description"
                        className="text-sm font-semibold text-zinc-900"
                    >
                        Description
                    </label>


                    <textarea
                        id="description"
                        name="description"
                        rows={5}
                        defaultValue={
                            provider.description ??
                            ""
                        }
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 text-sm outline-none transition focus:border-black"
                    />

                </div>


                <div className="mt-6">

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 p-4">

                        <input
                            name="active"
                            type="checkbox"
                            defaultChecked={
                                provider.active
                            }
                            className="h-4 w-4"
                        />


                        <div>

                            <p className="text-sm font-semibold text-zinc-900">
                                Active
                            </p>


                            <p className="mt-1 text-xs text-zinc-400">
                                Enable or disable this provider.
                            </p>

                        </div>

                    </label>

                </div>


                <div className="mt-8 flex gap-3">

                    <Link
                        href="/admin/providers"
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