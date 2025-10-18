import { NextResponse } from "next/server";
import { getTopRatedBooks } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? "10");
    console.log("[GET] /api/books/top-rated", { limit });

    const books = getTopRatedBooks(Number.isFinite(limit) && limit > 0 ? limit : 10);
    return NextResponse.json({ books });
}
