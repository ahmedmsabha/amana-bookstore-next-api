import { NextResponse } from "next/server";
import { getFeaturedBooks } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    console.log("[GET] /api/books/featured");
    const books = getFeaturedBooks();
    return NextResponse.json({ books });
}
