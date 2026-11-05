import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSuperadmin } from "@/lib/requireSuperadmin";
import { updateExampleAction } from "../../actions";


type EditExamplePageProps = {
    params: Promise<{
        id: string;
    }>;
};


export default async function EditExamplePage({
                                                  params,
                                              }: EditExamplePageProps) {
    const {
        id,
    } = await params;


    const {
        supabase,
    } = await requireSuperadmin();


    const {
        data: example,
        error,
    } = await supabase
        .from("generation_examples")
        .select(
            `
            id,
            input_text,
            output_text,
            notes,
            created_at,
            updated_at
            `
        )
        .eq("id", id)
        .maybeSingle();


    if (error) {
        console.error(
            "Could not load generation example:",
            error
        );
    }


    if (!example) {
        notFound();
    }


    const updateAction =
        updateExampleAction.bind(
            null,
            example.id
        );


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div className="mx-auto max-w-5xl">

                <Link
                    href="/admin/examples"
                    className="text-sm text-zinc-600 transition hover:text-black"
                >
                    ← Back to examples
                </Link>


                <div className="mt-10">

                    <p className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500">
                        EDIT
                    </p>


                    <h1 className="mt-3 text-4xl font-bold tracking-tight text-black">
                        Edit generation example
                    </h1>


                    <p className="mt-3 text-sm text-zinc-600">
                        Update the example input, expected output, or notes.
                    </p>

                </div>


                <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-7">

                    <form
                        action={updateAction}
                        className="space-y-6"
                    >

                        <div>

                            <label
                                htmlFor="input_text"
                                className="block text-sm font-semibold text-zinc-900"
                            >
                                Input
                            </label>


                            <p className="mt-1 text-xs text-zinc-500">
                                Example input that would be sent to the AI.
                            </p>


                            <textarea
                                id="input_text"
                                name="input_text"
                                required
                                defaultValue={example.input_text}
                                rows={5}
                                className="mt-3 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="output_text"
                                className="block text-sm font-semibold text-zinc-900"
                            >
                                Expected output
                            </label>


                            <p className="mt-1 text-xs text-zinc-500">
                                The response this example is expected to produce.
                            </p>


                            <textarea
                                id="output_text"
                                name="output_text"
                                required
                                defaultValue={example.output_text}
                                rows={5}
                                className="mt-3 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500"
                            />

                        </div>


                        <div>

                            <label
                                htmlFor="notes"
                                className="block text-sm font-semibold text-zinc-900"
                            >
                                Notes
                            </label>


                            <p className="mt-1 text-xs text-zinc-500">
                                Optional notes explaining this generation example.
                            </p>


                            <textarea
                                id="notes"
                                name="notes"
                                defaultValue={
                                    example.notes || ""
                                }
                                rows={4}
                                className="mt-3 w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-500"
                            />

                        </div>


                        <div className="flex items-center gap-3 border-t border-zinc-100 pt-6">

                            <Link
                                href="/admin/examples"
                                className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                            >
                                Save changes
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}