"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useTheme,
} from "next-themes";


export default function ThemeSwitcher()
{
    const {
        theme,
        resolvedTheme,
        setTheme,
    } =
        useTheme();


    const [
        mounted,
        setMounted,
    ] =
        useState(
            false
        );


    useEffect(
        () =>
        {
            setMounted(
                true
            );
        },
        []
    );


    if (
        !mounted
    )
    {
        return (
            <div className="space-y-2">

                <div className="h-16 rounded-xl border border-zinc-800 bg-black" />

                <div className="h-16 rounded-xl border border-zinc-800 bg-black" />

                <div className="h-16 rounded-xl border border-zinc-800 bg-black" />

            </div>
        );
    }


    const options = [
        {
            value:
                "system",

            label:
                "System",

            description:
                resolvedTheme ===
                "dark"
                    ? "Follow device · Dark"
                    : "Follow device · Light",
        },

        {
            value:
                "light",

            label:
                "Light",

            description:
                "Always use light mode",
        },

        {
            value:
                "dark",

            label:
                "Dark",

            description:
                "Always use dark mode",
        },
    ];


    return (
        <div className="space-y-2">

            {options.map(
                (
                    option
                ) =>
                {
                    const selected =
                        theme ===
                        option.value;


                    return (
                        <button
                            key={
                                option.value
                            }
                            type="button"
                            onClick={
                                () =>
                                {
                                    setTheme(
                                        option.value
                                    );
                                }
                            }
                            className={
                                selected
                                    ? "flex min-h-16 w-full items-center justify-between rounded-xl border border-blue-400 bg-zinc-800 px-3 py-3 text-left transition"
                                    : "flex min-h-16 w-full items-center justify-between rounded-xl border border-zinc-800 bg-black px-3 py-3 text-left transition hover:border-zinc-600 hover:bg-zinc-900"
                            }
                        >

                            <div>

                                <p
                                    className={
                                        selected
                                            ? "text-sm font-semibold text-white"
                                            : "text-sm font-semibold text-zinc-300"
                                    }
                                >
                                    {
                                        option.label
                                    }
                                </p>


                                <p
                                    className={
                                        selected
                                            ? "mt-1 text-[10px] text-zinc-300"
                                            : "mt-1 text-[10px] text-zinc-600"
                                    }
                                >
                                    {
                                        option.description
                                    }
                                </p>

                            </div>


                            <div
                                className={
                                    selected
                                        ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-blue-400"
                                        : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-600"
                                }
                            >

                                {selected && (
                                    <div className="h-3 w-3 rounded-full bg-blue-400" />
                                )}

                            </div>

                        </button>
                    );
                }
            )}

        </div>
    );
}