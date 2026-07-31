import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const results = await Article.find({
      status: "Published",
      $or: [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    })
      .select("title slug summary category createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      results,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Search failed",
      },
      {
        status: 500,
      }
    );
  }
}