import { NextResponse } from "next/server";
import { getBooksPublishedBetween } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    console.log("[GET] /api/books/published", { start, end });

    if (!start || !end) {
        return NextResponse.json(
            { error: "Provide start and end query params (YYYY-MM-DD)" },
            { status: 400 }
        );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
            { error: "Invalid date format. Use YYYY-MM-DD" },
            { status: 400 }
        );
    }

    const books = getBooksPublishedBetween(startDate, endDate);
    return NextResponse.json({ books });
}
