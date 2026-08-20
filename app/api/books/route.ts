import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { BookModel } from "@/models/Book";

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[\/\\]+/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeContentType(value: string) {
  const allowed = [
    "book",
    "manual",
    "standard",
    "note",
    "download",
  ];

  return allowed.includes(value) ? value : "book";
}

export async function GET() {
  try {
    await connectDB();

    const books = await BookModel.find({
      status: "Published",
    })
      .sort({
        featured: -1,
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    console.error("Get books error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch resources",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      title,
      author,
      description,
      category,
      contentType,
      coverImage,

      resourceType,
      fileUrl,
      filePublicId,
      externalUrl,

      pages,
      edition,
      publisher,
      year,

      license,
      source,
      sourceUrl,

      status,
      featured,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!category?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        {
          status: 400,
        }
      );
    }

    const finalResourceType =
      resourceType === "external"
        ? "external"
        : "hosted";

    if (
      finalResourceType === "hosted" &&
      !fileUrl
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "PDF file is required for hosted resources",
        },
        {
          status: 400,
        }
      );
    }

    if (
      finalResourceType === "external" &&
      !externalUrl?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Official resource URL is required",
        },
        {
          status: 400,
        }
      );
    }

    const slug = createSlug(title);

    const existingBook =
      await BookModel.findOne({
        slug,
      });

    if (existingBook) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A resource with this title already exists",
        },
        {
          status: 409,
        }
      );
    }

    const book = await BookModel.create({
      title: title.trim(),
      slug,

      author: author?.trim() || "",

      description:
        description?.trim() || "",

      category: category.trim(),

      contentType:
        normalizeContentType(contentType),

      coverImage: coverImage || "",

      resourceType: finalResourceType,

      fileUrl:
        finalResourceType === "hosted"
          ? fileUrl || ""
          : "",

      filePublicId:
        finalResourceType === "hosted"
          ? filePublicId || ""
          : "",

      externalUrl:
        finalResourceType === "external"
          ? externalUrl.trim()
          : "",

      pages: Number(pages) || 0,

      edition: edition?.trim() || "",

      publisher:
        publisher?.trim() || "",

      year:
        year && !Number.isNaN(Number(year))
          ? Number(year)
          : undefined,

      license:
        license?.trim() || "",

      source:
        source?.trim() || "PetroHub",

      sourceUrl:
        sourceUrl?.trim() || "",

      status:
        status === "Draft"
          ? "Draft"
          : "Published",

      featured: Boolean(featured),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Library resource created successfully",
        book,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create book error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create library resource",
      },
      {
        status: 500,
      }
    );
  }
}