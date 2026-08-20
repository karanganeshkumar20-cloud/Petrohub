import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid article ID",
        },
        { status: 400 }
      );
    }

    const article = await Article.findByIdAndUpdate(
      id,
      {
        $inc: {
          views: 1,
        },
      },
      {
        new: true,
      }
    ).select("views");

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: "Article not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: article.views,
    });
  } catch (error) {
    console.error("Increase article view error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update views",
      },
      { status: 500 }
    );
  }
}