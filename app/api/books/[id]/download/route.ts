import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { BookModel } from "@/models/Book";

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
          message: "Invalid resource ID",
        },
        { status: 400 }
      );
    }

    const book = await BookModel.findOneAndUpdate(
      {
        _id: id,
        status: "Published",
        resourceType: "hosted",
      },
      {
        $inc: {
          downloads: 1,
        },
      },
      {
        new: true,
      }
    ).select("downloads fileUrl");

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Hosted resource not found",
        },
        { status: 404 }
      );
    }

    if (!book.fileUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "PDF URL is missing",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      downloads: book.downloads,
      url: book.fileUrl,
    });
  } catch (error) {
    console.error("Download counter error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process download",
      },
      { status: 500 }
    );
  }
}