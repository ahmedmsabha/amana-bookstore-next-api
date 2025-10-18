import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { addBook, getBooks } from "@/lib/db";
import type { NewBookInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    console.log("[GET] /api/books");
    const books = getBooks();
    return NextResponse.json({ books });
}

export async function POST(req: Request) {
    console.log("[POST] /api/books");
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: Partial<NewBookInput>;
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Minimal required fields validation
    const required = [
        "title",
        "author",
        "description",
        "price",
        "image",
        "isbn",
        "datePublished",
        "pages",
        "language",
        "publisher",
        "inStock",
    ] as const;
    const missing = required.filter((k) => (payload as any)[k] === undefined);
    if (missing.length) {
        return NextResponse.json(
            { error: `Missing required fields: ${missing.join(", ")}` },
            { status: 400 }
        );
    }

    try {
        const created = addBook(payload as NewBookInput);
        return NextResponse.json({ book: created }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? "Failed to add book" },
            { status: 500 }
        );
    }
}
