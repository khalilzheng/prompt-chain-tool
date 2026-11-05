import type {
    Metadata,
} from "next";

import "./globals.css";

import ThemeProvider from "./ThemeProvider";


export const metadata: Metadata = {
    title:
        "Prompt Chain Tool",

    description:
        "Create, manage, and run multi-step prompt chains.",
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>)
{
    return (
        <html
            lang="en"
            suppressHydrationWarning
        >
        <body
            suppressHydrationWarning
        >
        <ThemeProvider>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}