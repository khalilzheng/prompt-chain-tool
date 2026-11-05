import Link from "next/link";


export default function UnauthorizedPage() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

            <section className="max-w-lg text-center">

                <div className="w-14 h-14 mx-auto mb-7 rounded-full border border-red-500/30 bg-red-500/10 grid place-items-center text-red-400">
                    !
                </div>


                <p className="text-xs text-red-400 font-semibold tracking-[0.2em] mb-4">
                    ACCESS DENIED
                </p>


                <h1 className="text-5xl font-semibold tracking-tight">
                    Admins only.
                </h1>


                <p className="mt-5 text-zinc-400 leading-7">
                    Your Google account is authenticated, but it does not have permission to access Meme Lab Admin.
                </p>


                <Link
                    href="/login"
                    className="inline-flex mt-9 px-7 h-12 items-center justify-center rounded-full bg-white text-black font-semibold"
                >
                    Use another account
                </Link>

            </section>

        </main>
    );
}