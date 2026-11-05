import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    createDomainAction,
} from "../actions";


type NewDomainPageProps = {
    searchParams: Promise<{
        error?: string;
    }>;
};


export default async function NewDomainPage({
                                                searchParams,
                                            }: NewDomainPageProps) {
    await requireSuperadmin();


    const params =
        await searchParams;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/domains"
                className="text-sm text-zinc-600 transition hover:text-black"
            >
                ← Back to signup domains
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    CREATE
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    New signup domain
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Allow users from a domain to sign up for Meme Lab.
                </p>

            </div>


            {params.error && (
                <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    Could not create this signup domain. Check the value and try again.
                </div>
            )}


            <form
                action={
                    createDomainAction
                }
                className="mt-8 max-w-3xl rounded-3xl border border-zinc-200 bg-white p-7"
            >

                <div>

                    <label
                        htmlFor="domain"
                        className="text-sm font-semibold"
                    >
                        Domain
                    </label>


                    <p className="mt-1 text-xs text-zinc-400">
                        Enter a domain such as columbia.edu. Do not include an email address.
                    </p>


                    <input
                        id="domain"
                        name="domain"
                        type="text"
                        required
                        placeholder="columbia.edu"
                        className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm outline-none transition focus:border-zinc-500"
                    />

                </div>


                <div className="mt-6 rounded-2xl border border-zinc-200 p-5">

                    <label className="flex cursor-pointer items-center gap-4">

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
                                Allow signups from this domain.
                            </p>

                        </div>

                    </label>

                </div>


                <div className="mt-7 flex gap-3">

                    <Link
                        href="/admin/domains"
                        className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold transition hover:bg-zinc-50"
                    >
                        Cancel
                    </Link>


                    <button
                        type="submit"
                        className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Create domain
                    </button>

                </div>

            </form>

        </div>
    );
}