import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import DeleteConfirmationGuard from "./DeleteConfirmationGuard";
import LogoutButton from "./LogoutButton";
import ThemeSwitcher from "./ThemeSwitcher";


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
        <div className="min-h-screen bg-zinc-100 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">

            <DeleteConfirmationGuard />


            <div className="min-h-screen">

                {/* SIDEBAR */}

                <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col bg-black px-5 py-6 text-white">

                    {/* BRAND */}

                    <div className="flex items-center gap-3">

                        <div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-sm font-bold text-black">
                            P
                        </div>


                        <div>

                            <p className="text-sm font-semibold text-white">
                                Prompt Chain Tool
                            </p>


                            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.2em] text-zinc-500">
                                SUPERADMIN
                            </p>

                        </div>

                    </div>


                    {/* NAVIGATION */}

                    <nav className="mt-9 flex-1">

                        <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                            PROMPTING
                        </p>


                        <Link
                            href="/admin/prompt-chains"
                            className="block rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                        >
                            Prompt Chains
                        </Link>


                        {/* APPEARANCE */}

                        <div className="mt-8">

                            <p className="mb-3 px-3 text-[9px] font-semibold tracking-[0.2em] text-zinc-600">
                                APPEARANCE
                            </p>


                            <ThemeSwitcher />

                        </div>

                    </nav>


                    {/* ACCOUNT */}

                    <div className="border-t border-zinc-800 pt-5">

                        <p className="text-[9px] font-semibold tracking-[0.18em] text-zinc-600">
                            SIGNED IN AS
                        </p>


                        <div className="mt-3 flex items-center gap-3">

                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-zinc-700 text-xs font-semibold text-white">
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


                {/* MAIN */}

                <main className="ml-[220px] min-h-screen">
                    {children}
                </main>

            </div>

        </div>
    );
}