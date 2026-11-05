import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import LogoutButton from "./LogoutButton";
import DeleteConfirmationGuard from "./DeleteConfirmationGuard";


export default async function AdminLayout({
                                              children,
                                          }: Readonly<{
    children: React.ReactNode;
}>)
{
    const {
        profile,
    } =
        await requireSuperadmin();


    const firstName =
        profile.first_name ||
        "Admin";


    const lastName =
        profile.last_name ||
        "";


    const fullName =
        `${firstName} ${lastName}`.trim();


    const initial =
        firstName
            .charAt(0)
            .toUpperCase();


    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-950">

            <DeleteConfirmationGuard />

            <div className="flex min-h-screen">

                {/* SIDEBAR */}

                <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col bg-black px-5 py-6 text-white">

                    {/* BRAND */}

                    <div className="flex items-center gap-3">

                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-sm font-bold text-black">
                            M
                        </div>


                        <div>

                            <p className="text-sm font-semibold">
                                Meme Lab
                            </p>

                            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-zinc-500">
                                ADMIN
                            </p>

                        </div>

                    </div>


                    {/* NAVIGATION */}

                    <nav className="mt-9 flex-1 overflow-y-auto pr-1">

                        {/* OVERVIEW */}

                        <div>

                            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                                OVERVIEW
                            </p>


                            <Link
                                href="/admin"
                                className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                            >
                                Overview
                            </Link>

                        </div>


                        {/* CONTENT */}

                        <div className="mt-6">

                            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                                CONTENT
                            </p>


                            <div className="space-y-1">

                                <Link
                                    href="/admin/users"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Users
                                </Link>


                                <Link
                                    href="/admin/memes"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Memes
                                </Link>


                                <Link
                                    href="/admin/terms"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Terms
                                </Link>


                                <Link
                                    href="/admin/votes"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Votes
                                </Link>


                                <Link
                                    href="/admin/images"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Images
                                </Link>

                            </div>

                        </div>


                        {/* PROMPTING */}

                        <div className="mt-6">

                            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                                PROMPTING
                            </p>


                            <div className="space-y-1">

                                <Link
                                    href="/admin/prompt-chains"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Prompt Chains
                                </Link>


                                <Link
                                    href="/admin/prompt-mix"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Prompt Mix
                                </Link>

                            </div>

                        </div>


                        {/* AI GENERATION */}

                        <div className="mt-6">

                            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                                AI GENERATION
                            </p>


                            <div className="space-y-1">

                                <Link
                                    href="/admin/examples"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Examples
                                </Link>


                                <Link
                                    href="/admin/requests"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Generation Requests
                                </Link>


                                <Link
                                    href="/admin/responses"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    LLM Responses
                                </Link>

                            </div>

                        </div>


                        {/* AI CONFIGURATION */}

                        <div className="mt-6">

                            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                                AI CONFIGURATION
                            </p>


                            <div className="space-y-1">

                                <Link
                                    href="/admin/providers"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Providers
                                </Link>


                                <Link
                                    href="/admin/models"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Models
                                </Link>

                            </div>

                        </div>


                        {/* ACCESS CONTROL */}

                        <div className="mt-6">

                            <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                                ACCESS CONTROL
                            </p>


                            <div className="space-y-1">

                                <Link
                                    href="/admin/domains"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Signup Domains
                                </Link>


                                <Link
                                    href="/admin/whitelist"
                                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    Whitelisted Emails
                                </Link>

                            </div>

                        </div>

                    </nav>


                    {/* ACCOUNT */}

                    <div className="border-t border-zinc-800 pt-5">

                        <p className="text-[9px] font-semibold tracking-[0.18em] text-zinc-600">
                            SIGNED IN AS
                        </p>


                        <div className="mt-3 flex items-center gap-3">

                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-zinc-700 text-xs font-semibold">
                                {initial}
                            </div>


                            <div className="min-w-0">

                                <p className="truncate text-xs font-semibold text-white">
                                    {fullName}
                                </p>

                                <p className="mt-1 text-[9px] font-semibold tracking-[0.12em] text-zinc-600">
                                    SUPERADMIN
                                </p>

                            </div>

                        </div>


                        <div className="mt-4">
                            <LogoutButton />
                        </div>

                    </div>

                </aside>


                {/* MAIN CONTENT */}

                <main className="ml-[220px] min-h-screen w-[calc(100%-220px)]">
                    {children}
                </main>

            </div>

        </div>
    );
}