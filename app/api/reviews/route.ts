import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { addReview } from "@/lib/db";
import type { NewReviewInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    console.log("[POST] /api/reviews");
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: Partial<NewReviewInput>;
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const required = ["bookId", "author", "rating", "title", "comment"] as const;
    const missing = required.filter((k) => (payload as any)[k] === undefined);
    if (missing.length) {
        return NextResponse.json(
            { error: `Missing required fields: ${missing.join(", ")}` },
            { status: 400 }
        );
    }

    const rating = Number(payload.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
        return NextResponse.json({ error: "rating must be between 0 and 5" }, { status: 400 });
    }

    try {
        const created = addReview(payload as NewReviewInput);
        return NextResponse.json({ review: created }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? "Failed to add review" },
            { status: 500 }
        );
    }
}
