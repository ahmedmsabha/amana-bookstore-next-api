import { NextRequest, NextResponse } from "next/server";
import { getBookById } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    console.log(`[GET] /api/books/${id}`);
    const book = getBookById(id);
    if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    return NextResponse.json({ book });
}
