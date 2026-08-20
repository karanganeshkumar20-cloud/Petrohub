import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { BookModel } from "@/models/Book";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid resource ID",
        },
        {
          status: 400,
        }
      );
    }

    const book = await BookModel.findById(id).lean();

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      book,
    });
  } catch (error) {
    console.error("Get resource error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch resource",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid resource ID",
        },
        {
          status: 400,
        }
      );
    }

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

    const duplicateBook =
      await BookModel.findOne({
        slug,
        _id: {
          $ne: id,
        },
      });

    if (duplicateBook) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another resource already uses this title",
        },
        {
          status: 409,
        }
      );
    }

    const updatedBook =
      await BookModel.findByIdAndUpdate(
        id,
        {
          title: title.trim(),
          slug,

          author:
            author?.trim() || "",

          description:
            description?.trim() || "",

          category:
            category.trim(),

          contentType:
            normalizeContentType(
              contentType
            ),

          coverImage:
            coverImage || "",

          resourceType:
            finalResourceType,

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

          pages:
            Number(pages) || 0,

          edition:
            edition?.trim() || "",

          publisher:
            publisher?.trim() || "",

          year:
            year &&
            !Number.isNaN(Number(year))
              ? Number(year)
              : undefined,

          license:
            license?.trim() || "",

          source:
            source?.trim() ||
            "PetroHub",

          sourceUrl:
            sourceUrl?.trim() || "",

          status:
            status === "Draft"
              ? "Draft"
              : "Published",

          featured:
            Boolean(featured),
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedBook) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Library resource updated successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.error(
      "Update resource error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update library resource",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid resource ID",
        },
        {
          status: 400,
        }
      );
    }

    const book =
      await BookModel.findByIdAndDelete(id);

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Library resource deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete resource error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to delete library resource",
      },
      {
        status: 500,
      }
    );
  }
}