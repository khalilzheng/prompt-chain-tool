import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Meme Lab Admin",
    description: "Administration dashboard for Meme Lab",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}