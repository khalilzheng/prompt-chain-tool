import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    updateDomainAction,
} from "../../actions";


type EditDomainPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


type AllowedSignupDomain = {
    id: string;
    domain: string;
    active: boolean;
};


export default async function EditDomainPage({
                                                 params,
                                                 searchParams,
                                             }: EditDomainPageProps) {
    const {
        id,
    } =
        await params;


    const query =
        await searchParams;


    const {
        supabase,
    } =
        await requireSuperadmin();


    const {
        data,
        error,
    } =
        await supabase
            .from(
                "allowed_signup_domains"
            )
            .select(
                `
                id,
                domain,
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


    const domain =
        data as AllowedSignupDomain;


    const updateAction =
        updateDomainAction.bind(
            null,
            domain.id
        );


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
                    EDIT
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Edit signup domain
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Update this domain and its signup availability.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    Could not update this signup domain.
                </div>
            )}


            <form
                action={
                    updateAction
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


                    <input
                        id="domain"
                        name="domain"
                        type="text"
                        required
                        defaultValue={
                            domain.domain
                        }
                        className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-4 text-sm outline-none transition focus:border-zinc-500"
                    />

                </div>


                <div className="mt-6 rounded-2xl border border-zinc-200 p-5">

                    <label className="flex cursor-pointer items-center gap-4">

                        <input
                            name="active"
                            type="checkbox"
                            defaultChecked={
                                domain.active
                            }
                            className="h-4 w-4"
                        />


                        <div>

                            <p className="text-sm font-semibold">
                                Active
                            </p>


                            <p className="mt-1 text-xs text-zinc-400">
                                Enable or disable signups from this domain.
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
                        Save changes
                    </button>

                </div>

            </form>

        </div>
    );
}