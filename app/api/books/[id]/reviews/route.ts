import { NextResponse } from "next/server";
import { getReviewsByBookId, getBookById } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
    console.log(`[GET] /api/books/${params.id}/reviews`);
    // Optionally 404 if the book doesn't exist
    const book = getBookById(params.id);
    if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const reviews = getReviewsByBookId(params.id);
    return NextResponse.json({ reviews });
}
