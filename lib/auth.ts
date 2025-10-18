const DEMO_API_KEY = "demo-key-12345";

export function isAuthorized(req: Request): boolean {
    // Accept x-api-key, Bearer token, or api_key query param
    const apiKeyHeader = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : undefined;
    let apiKeyQuery: string | null = null;
    try {
        const url = new URL(req.url);
        apiKeyQuery = url.searchParams.get("api_key");
    } catch {
        // ignore URL parse errors
    }

    const configured = (process.env.API_KEYS ?? process.env.API_KEY ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    // Development-friendly behavior: if no keys configured, allow.
    if (configured.length === 0) return true;

    const provided = apiKeyHeader ?? bearer ?? apiKeyQuery ?? undefined;
    if (!provided) return false;

    // In non-production, also accept the demo key for quick testing
    const isNonProd = (process.env.NODE_ENV ?? "development") !== "production";
    if (isNonProd && provided === DEMO_API_KEY) return true;

    return configured.includes(provided);
}

export function getDemoApiKey(): string {
    return DEMO_API_KEY;
}
