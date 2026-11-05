import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import {
    updateWhitelistedEmailAction,
} from "../../actions";


type EditWhitelistPageProps = {
    params: Promise<{
        id: string;
    }>;

    searchParams: Promise<{
        error?: string;
    }>;
};


type WhitelistedEmail = {
    id: string;
    email: string;
    active: boolean;
};


export default async function EditWhitelistPage({
                                                    params,
                                                    searchParams,
                                                }: EditWhitelistPageProps) {
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
                "whitelisted_emails"
            )
            .select(
                `
                id,
                email,
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


    const item =
        data as WhitelistedEmail;


    const updateAction =
        updateWhitelistedEmailAction.bind(
            null,
            item.id
        );


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <Link
                href="/admin/whitelist"
                className="text-sm text-zinc-600 transition hover:text-black"
            >
                ← Back to whitelisted emails
            </Link>


            <div className="mt-8">

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    EDIT
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
                    Edit whitelisted email
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Update this email address and its access status.
                </p>

            </div>


            {query.error && (
                <div className="mt-7 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    Could not update this email address.
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
                        htmlFor="email"
                        className="text-sm font-semibold"
                    >
                        Email address
                    </label>


                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        defaultValue={
                            item.email
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
                                item.active
                            }
                            className="h-4 w-4"
                        />


                        <div>

                            <p className="text-sm font-semibold">
                                Active
                            </p>


                            <p className="mt-1 text-xs text-zinc-400">
                                Enable or disable this whitelisted email.
                            </p>

                        </div>

                    </label>

                </div>


                <div className="mt-7 flex gap-3">

                    <Link
                        href="/admin/whitelist"
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