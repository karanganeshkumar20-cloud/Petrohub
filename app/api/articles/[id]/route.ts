import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
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

    const article = await Article.findById(id);

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
      article,
    });
  } catch (error) {
    console.error("GET article error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch article",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
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

    const body = await request.json();

    const article = await Article.findByIdAndUpdate(
      id,
      {
        title: body.title,
        summary: body.summary,
        content: body.content,
        category: body.category,
        tags: body.tags ?? [],
        featuredImage: body.featuredImage ?? "",
        source: body.source ?? "PetroHub",
        sourceUrl: body.sourceUrl ?? "",
        license: body.license ?? "",
        author: body.author ?? "PetroHub Team",
        status: body.status ?? "Draft",
        featured: body.featured ?? false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

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
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    console.error("PUT article error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update article",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
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

    const article = await Article.findByIdAndDelete(id);

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
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("DELETE article error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete article",
      },
      { status: 500 }
    );
  }
}