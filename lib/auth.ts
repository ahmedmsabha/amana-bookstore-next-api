export function isAuthorized(req: Request): boolean {
    // Accept either x-api-key header or Bearer token
    const apiKeyHeader = req.headers.get("x-api-key");
    const authHeader = req.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : undefined;

    const configured = (process.env.API_KEYS ?? process.env.API_KEY ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    // If no keys configured, allow (dev-friendly). Configure API_KEYS to enforce.
    if (configured.length === 0) return true;

    const provided = apiKeyHeader ?? bearer;
    return !!provided && configured.includes(provided);
}
