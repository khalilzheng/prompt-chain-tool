import { requireSuperadmin } from "@/lib/requireSuperadmin";


type GenerationRequest = {
    id: string;
    user_id: string | null;
    image_id: string | null;
    prompt: string | null;
    status: string;
    created_at: string;
};


type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
};


function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(value));
}


function shortenId(value: string | null) {
    if (!value) {
        return "—";
    }

    return `${value.slice(0, 8)}...`;
}


export default async function GenerationRequestsPage() {
    const {
        supabase,
    } = await requireSuperadmin();


    const [
        requestsResult,
        profilesResult,
    ] =
        await Promise.all([
            supabase
                .from("generation_requests")
                .select(
                    `
                    id,
                    user_id,
                    image_id,
                    prompt,
                    status,
                    created_at
                    `
                )
                .order(
                    "created_at",
                    {
                        ascending: false,
                    }
                ),

            supabase
                .from("profiles")
                .select(
                    `
                    id,
                    first_name,
                    last_name
                    `
                ),
        ]);


    if (requestsResult.error) {
        console.error(
            "Could not load generation requests:",
            requestsResult.error
        );
    }


    if (profilesResult.error) {
        console.error(
            "Could not load profiles:",
            profilesResult.error
        );
    }


    const requests =
        (
            requestsResult.data ??
            []
        ) as GenerationRequest[];


    const profiles =
        (
            profilesResult.data ??
            []
        ) as Profile[];


    const profileNames =
        new Map(
            profiles.map(
                (
                    profile
                ) => {
                    const name =
                        `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();

                    return [
                        profile.id,
                        name || "Unnamed user",
                    ];
                }
            )
        );


    const pendingCount =
        requests.filter(
            (
                request
            ) =>
                request.status
                    .toLowerCase() ===
                "pending"
        ).length;


    const completedCount =
        requests.filter(
            (
                request
            ) =>
                request.status
                    .toLowerCase() ===
                "completed"
        ).length;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div>

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    AI GENERATION
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                    Generation Requests
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Review AI generation requests submitted to Meme Lab.
                </p>

            </div>


            <div className="mt-8 grid gap-4 md:grid-cols-3">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        REQUESTS
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {requests.length}
                    </p>


                    <p className="mt-2 text-sm text-zinc-400">
                        Total generation requests
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        PENDING
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {pendingCount}
                    </p>


                    <p className="mt-2 text-sm text-zinc-400">
                        Waiting for completion
                    </p>

                </div>


                <div className="rounded-3xl bg-black p-6 text-white">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        COMPLETED
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {completedCount}
                    </p>


                    <p className="mt-2 text-sm text-zinc-500">
                        Finished requests
                    </p>

                </div>

            </div>


            <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white">

                <div className="border-b border-zinc-100 px-6 py-5">

                    <p className="font-semibold">
                        Request history
                    </p>


                    <p className="mt-1 text-sm text-zinc-400">
                        Inspect prompts, users, images, and request status.
                    </p>

                </div>


                <div className="hidden grid-cols-[1.2fr_2fr_1fr_1fr_1.2fr] gap-5 border-b border-zinc-100 bg-zinc-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 md:grid">

                    <div>User</div>
                    <div>Prompt</div>
                    <div>Image</div>
                    <div>Status</div>
                    <div>Created</div>

                </div>


                <div className="divide-y divide-zinc-100">

                    {requests.map(
                        (
                            request
                        ) => (
                            <div
                                key={request.id}
                                className="grid gap-5 px-6 py-5 md:grid-cols-[1.2fr_2fr_1fr_1fr_1.2fr] md:items-center"
                            >

                                <div>

                                    <p className="text-sm font-semibold">
                                        {request.user_id
                                            ? profileNames.get(
                                                request.user_id
                                            ) ??
                                            "Unknown user"
                                            : "Anonymous"}
                                    </p>


                                    <p className="mt-1 text-xs text-zinc-400">
                                        {shortenId(
                                            request.user_id
                                        )}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-sm leading-6 text-zinc-700">
                                        {request.prompt ||
                                            "No prompt provided"}
                                    </p>

                                </div>


                                <div>

                                    <code className="text-xs text-zinc-500">
                                        {shortenId(
                                            request.image_id
                                        )}
                                    </code>

                                </div>


                                <div>

                                    <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold capitalize text-zinc-700">
                                        {request.status}
                                    </span>

                                </div>


                                <div>

                                    <p className="text-xs text-zinc-500">
                                        {formatDate(
                                            request.created_at
                                        )}
                                    </p>

                                </div>

                            </div>
                        )
                    )}


                    {requests.length === 0 && (
                        <div className="px-8 py-20 text-center">

                            <p className="font-semibold">
                                No generation requests found.
                            </p>


                            <p className="mt-2 text-sm text-zinc-400">
                                Generation activity will appear here.
                            </p>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}