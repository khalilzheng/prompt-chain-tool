"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";


export default function LoginPage()
{
    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);


    const [isLoading, setIsLoading] =
        useState(false);


    async function handleGoogleLogin()
    {
        setErrorMessage(null);
        setIsLoading(true);


        const supabase =
            createBrowserClient(
                process.env
                    .NEXT_PUBLIC_SUPABASE_URL!,
                process.env
                    .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            );


        const redirectUrl =
            `${window.location.origin}/auth/callback`;


        const {
            error,
        } =
            await supabase.auth.signInWithOAuth({
                provider: "google",

                options: {
                    redirectTo:
                    redirectUrl,
                },
            });


        if (error)
        {
            console.error(
                "Google login error:",
                error
            );


            setErrorMessage(
                "Could not start Google sign-in."
            );


            setIsLoading(false);
        }
    }


    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">

            <div className="w-full max-w-xl rounded-[32px] border border-zinc-800 bg-zinc-950 p-12">

                {/* BRAND */}

                <div className="flex items-center gap-4">

                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-white text-xl font-bold text-black">
                        M
                    </div>


                    <div>

                        <p className="text-2xl font-bold text-white">
                            Meme Lab
                        </p>


                        <p className="mt-1 text-sm font-semibold tracking-[0.18em] text-zinc-500">
                            ADMIN
                        </p>

                    </div>

                </div>


                {/* CONTENT */}

                <div className="mt-14">

                    <p className="text-sm font-bold tracking-[0.22em] text-blue-400">
                        ADMIN ACCESS
                    </p>


                    <h1 className="mt-6 text-5xl font-bold tracking-tight text-white">
                        Welcome back.
                    </h1>


                    <p className="mt-6 max-w-md text-xl leading-8 text-zinc-400">
                        Sign in with an authorized Google account to manage Meme Lab.
                    </p>

                </div>


                {/* GOOGLE LOGIN */}

                <div className="mt-12">

                    <button
                        type="button"
                        onClick={
                            handleGoogleLogin
                        }
                        disabled={
                            isLoading
                        }
                        className="w-full rounded-full bg-white px-6 py-5 text-lg font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading
                            ? "Redirecting..."
                            : "Continue with Google"}
                    </button>


                    {errorMessage && (

                        <p className="mt-4 text-center text-sm text-red-400">
                            {errorMessage}
                        </p>

                    )}

                </div>


                <p className="mt-10 text-center text-sm text-zinc-600">
                    Authorized administrators only.
                </p>

            </div>

        </main>
    );
}