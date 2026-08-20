import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { BookModel } from "@/models/Book";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: Context
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

    const book =
      await BookModel.findByIdAndUpdate(
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

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: "Resource not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      views: book.views,
    });
  } catch (error) {
    console.error(
      "Book view counter error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update views",
      },
      { status: 500 }
    );
  }
}