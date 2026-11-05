import { requireSuperadmin } from "@/lib/requireSuperadmin";


type LlmResponse = {
    id: string;
    generation_request_id: string | null;
    model_id: string | null;
    response_text: string;
    latency_ms: number | null;
    created_at: string;
};


type Model = {
    id: string;
    name: string;
    model_key: string;
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


export default async function LlmResponsesPage() {
    const {
        supabase,
    } = await requireSuperadmin();


    const [
        responsesResult,
        modelsResult,
    ] =
        await Promise.all([
            supabase
                .from("llm_responses")
                .select(
                    `
                    id,
                    generation_request_id,
                    model_id,
                    response_text,
                    latency_ms,
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
                .from("llm_models")
                .select(
                    `
                    id,
                    name,
                    model_key
                    `
                ),
        ]);


    if (responsesResult.error) {
        console.error(
            "Could not load LLM responses:",
            responsesResult.error
        );
    }


    if (modelsResult.error) {
        console.error(
            "Could not load models:",
            modelsResult.error
        );
    }


    const responses =
        (
            responsesResult.data ??
            []
        ) as LlmResponse[];


    const models =
        (
            modelsResult.data ??
            []
        ) as Model[];


    const modelMap =
        new Map(
            models.map(
                (
                    model
                ) => [
                    model.id,
                    model,
                ]
            )
        );


    const responsesWithLatency =
        responses.filter(
            (
                response
            ) =>
                response.latency_ms !== null
        );


    const averageLatency =
        responsesWithLatency.length > 0
            ? Math.round(
                responsesWithLatency.reduce(
                    (
                        total,
                        response
                    ) =>
                        total +
                        (
                            response.latency_ms ??
                            0
                        ),
                    0
                ) /
                responsesWithLatency.length
            )
            : 0;


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            <div>

                <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                    AI GENERATION
                </p>


                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                    LLM Responses
                </h1>


                <p className="mt-3 text-sm text-zinc-500">
                    Inspect responses returned by configured language models.
                </p>

            </div>


            <div className="mt-8 grid gap-4 md:grid-cols-2">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        RESPONSES
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {responses.length}
                    </p>


                    <p className="mt-2 text-sm text-zinc-400">
                        Recorded LLM responses
                    </p>

                </div>


                <div className="rounded-3xl bg-black p-6 text-white">

                    <p className="text-[10px] font-semibold tracking-[0.18em] text-zinc-500">
                        AVERAGE LATENCY
                    </p>


                    <p className="mt-4 text-4xl font-semibold">
                        {averageLatency}
                        <span className="ml-2 text-lg font-medium text-zinc-500">
                            ms
                        </span>
                    </p>


                    <p className="mt-2 text-sm text-zinc-500">
                        Across measured responses
                    </p>

                </div>

            </div>


            <div className="mt-8 space-y-4">

                {responses.map(
                    (
                        response
                    ) => {
                        const model =
                            response.model_id
                                ? modelMap.get(
                                    response.model_id
                                )
                                : undefined;


                        return (
                            <div
                                key={response.id}
                                className="rounded-3xl border border-zinc-200 bg-white p-6"
                            >

                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                                    <div>

                                        <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400">
                                            MODEL
                                        </p>


                                        <p className="mt-2 font-semibold">
                                            {model?.name ??
                                                "Unknown model"}
                                        </p>


                                        {model && (
                                            <code className="mt-2 inline-block rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                                                {model.model_key}
                                            </code>
                                        )}

                                    </div>


                                    <div className="text-left md:text-right">

                                        <p className="text-xs text-zinc-400">
                                            {formatDate(
                                                response.created_at
                                            )}
                                        </p>


                                        <p className="mt-2 text-xs font-medium text-zinc-500">
                                            {response.latency_ms !==
                                            null
                                                ? `${response.latency_ms} ms`
                                                : "Latency unavailable"}
                                        </p>

                                    </div>

                                </div>


                                <div className="mt-6 rounded-2xl bg-zinc-50 p-5">

                                    <p className="text-[10px] font-semibold tracking-[0.16em] text-zinc-400">
                                        RESPONSE
                                    </p>


                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-800">
                                        {
                                            response.response_text
                                        }
                                    </p>

                                </div>


                                <div className="mt-5">

                                    <p className="text-xs text-zinc-400">
                                        Request ID
                                    </p>


                                    <code className="mt-1 block text-xs text-zinc-600">
                                        {shortenId(
                                            response.generation_request_id
                                        )}
                                    </code>

                                </div>

                            </div>
                        );
                    }
                )}


                {responses.length === 0 && (
                    <div className="rounded-3xl border border-zinc-200 bg-white px-8 py-20 text-center">

                        <p className="font-semibold">
                            No LLM responses found.
                        </p>


                        <p className="mt-2 text-sm text-zinc-400">
                            Model responses will appear here when generation requests are processed.
                        </p>

                    </div>
                )}

            </div>

        </div>
    );
}