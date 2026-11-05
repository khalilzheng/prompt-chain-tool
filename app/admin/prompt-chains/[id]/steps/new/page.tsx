import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    createPromptChainStepAction,
} from "../../../actions";


type NewStepPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


export default async function NewStepPage({
                                              params,
                                              searchParams,
                                          }: NewStepPageProps)
{
    await requireSuperadmin();


    const {
        id,
    } =
        await params;


    const query =
        await searchParams;


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
                    CREATE
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Add Prompt Chain Step
                </h1>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    The step could not be created. Make sure both fields are completed.
                </div>
            )}


            <form
                action={
                    createPromptChainStepAction.bind(
                        null,
                        id
                    )
                }
                className="mt-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7"
            >

                <div>

                    <label
                        htmlFor="name"
                        className="text-sm font-semibold"
                    >
                        Step Name
                    </label>


                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Example: Analyze image"
                        className="mt-4 h-12 w-full rounded-xl border border-zinc-200 px-4 outline-none focus:border-black"
                    />

                </div>


                <div className="mt-6">

                    <label
                        htmlFor="prompt_template"
                        className="text-sm font-semibold"
                    >
                        Prompt
                    </label>


                    <textarea
                        id="prompt_template"
                        name="prompt_template"
                        required
                        rows={8}
                        placeholder="Example: Describe the important visual details in this image."
                        className="mt-4 w-full resize-none rounded-xl border border-zinc-200 p-4 outline-none focus:border-black"
                    />

                </div>


                <div className="mt-8 flex gap-3">

                    <Link
                        href={
                            `/admin/prompt-chains/${id}`
                        }
                        className="flex h-11 items-center rounded-full border border-zinc-200 px-6 text-sm font-semibold"
                    >
                        Cancel
                    </Link>


                    <button
                        type="submit"
                        className="h-11 rounded-full bg-black px-7 text-sm font-semibold text-white"
                    >
                        Add Step
                    </button>

                </div>

            </form>

        </div>
    );
}