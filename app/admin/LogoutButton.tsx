"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
    const [loading, setLoading] =
        useState(false);

    async function handleLogout() {
        setLoading(true);

        const supabase =
            createClient();

        await supabase.auth.signOut();

        window.location.href =
            "/login";
    }

    return (
        <button
            type="button"
            onClick={
                handleLogout
            }
            disabled={
                loading
            }
            className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-800 px-4 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span>
                {loading
                    ? "Signing out..."
                    : "Log out"}
            </span>

            <span
                aria-hidden="true"
                className="text-base"
            >
                →
            </span>
        </button>
    );
}