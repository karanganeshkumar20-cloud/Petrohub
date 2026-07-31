import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    await connectDB();

    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        articles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get articles error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch articles",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      title,
      summary,
      content,
      category,
      tags,
      featuredImage,
      source,
      sourceUrl,
      license,
      author,
      status,
      featured,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and category are required",
        },
        { status: 400 }
      );
    }

    const slug = createSlug(title);

    const existingArticle = await Article.findOne({ slug });

    if (existingArticle) {
      return NextResponse.json(
        {
          success: false,
          message: "An article with this title already exists",
        },
        { status: 409 }
      );
    }

    const article = await Article.create({
      title,
      slug,
      summary: summary || "",
      content: content || "",
      category,
      tags: Array.isArray(tags) ? tags : [],
      featuredImage: featuredImage || "",
      source: source || "PetroHub",
      sourceUrl: sourceUrl || "",
      license: license || "",
      author: author || "PetroHub Team",
      status: status || "Draft",
      featured: Boolean(featured),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Article created successfully",
        article,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create article error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create article",
      },
      { status: 500 }
    );
  }
}