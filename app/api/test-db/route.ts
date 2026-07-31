import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB Connected Successfully ✅",
    });
  } catch (error: any) {
    console.error("MongoDB Error:", error);

    return NextResponse.json(
      {
        success: false,
        name: error?.name,
        message: error?.message,
        code: error?.code,
        cause: error?.cause,
      },
      { status: 500 }
    );
  }
}