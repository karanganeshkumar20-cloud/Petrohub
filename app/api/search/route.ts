import {
  NextRequest,
  NextResponse,
} from "next/server";

import { connectDB } from "@/lib/mongodb";

import Article from "@/models/Article";
import { BookModel } from "@/models/Book";

export const runtime = "nodejs";

function escapeRegex(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const searchParams =
      request.nextUrl.searchParams;

    const rawQuery =
      searchParams.get("q")?.trim() || "";

    if (!rawQuery) {
      return NextResponse.json({
        success: true,
        query: "",
        results: [],
        total: 0,
      });
    }

    /*
     * Prevent extremely long search
     * strings from creating expensive
     * MongoDB regex queries.
     */
    const query =
      rawQuery.slice(0, 100);

    const safeQuery =
      escapeRegex(query);

    const regex = new RegExp(
      safeQuery,
      "i"
    );

    /*
     * Search Articles and Library
     * resources in parallel.
     */
    const [
      articles,
      books,
    ] = await Promise.all([
      Article.find({
        status: "Published",

        $or: [
          {
            title: regex,
          },
          {
            summary: regex,
          },
          {
            content: regex,
          },
          {
            category: regex,
          },
        ],
      })
        .select(
          "title slug summary category createdAt"
        )
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean(),

      BookModel.find({
        status: "Published",

        $or: [
          {
            title: regex,
          },
          {
            author: regex,
          },
          {
            description: regex,
          },
          {
            category: regex,
          },
          {
            publisher: regex,
          },
          {
            edition: regex,
          },
          {
            source: regex,
          },
        ],
      })
        .select(
          [
            "title",
            "slug",
            "author",
            "description",
            "category",
            "contentType",
            "resourceType",
            "publisher",
            "coverImage",
            "createdAt",
          ].join(" ")
        )
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean(),
    ]);

    /*
     * Normalize Article results.
     */
    const articleResults =
      articles.map((article: any) => ({
        id:
          article._id.toString(),

        title:
          article.title,

        slug:
          article.slug,

        description:
          article.summary || "",

        category:
          article.category || "",

        resultType:
          "article",

        typeLabel:
          "Article",

        href:
          `/articles/${article.slug}`,

        author:
          "",

        coverImage:
          "",

        resourceType:
          "",

        createdAt:
          article.createdAt,
      }));

    /*
     * Normalize Library results.
     */
    const libraryResults =
      books.map((book: any) => ({
        id:
          book._id.toString(),

        title:
          book.title,

        slug:
          book.slug,

        description:
          book.description || "",

        category:
          book.category || "",

        resultType:
          "library",

        typeLabel:
          getContentTypeLabel(
            book.contentType
          ),

        contentType:
          book.contentType,

        resourceType:
          book.resourceType,

        href:
          `/library/${book.slug}`,

        author:
          book.author || "",

        publisher:
          book.publisher || "",

        coverImage:
          book.coverImage || "",

        createdAt:
          book.createdAt,
      }));

    /*
     * Combine both result types.
     */
    const combinedResults = [
      ...articleResults,
      ...libraryResults,
    ];

    /*
     * Sort newest first.
     */
    combinedResults.sort(
      (a, b) => {
        const dateA =
          a.createdAt
            ? new Date(
                a.createdAt
              ).getTime()
            : 0;

        const dateB =
          b.createdAt
            ? new Date(
                b.createdAt
              ).getTime()
            : 0;

        return dateB - dateA;
      }
    );

    /*
     * Return maximum 30 results.
     */
    const results =
      combinedResults.slice(
        0,
        30
      );

    return NextResponse.json({
      success: true,

      query,

      results,

      total:
        results.length,

      counts: {
        articles:
          articleResults.length,

        library:
          libraryResults.length,
      },
    });
  } catch (error) {
    console.error(
      "Search API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to complete search",

        results: [],
      },
      {
        status: 500,
      }
    );
  }
}

function getContentTypeLabel(
  contentType?: string
) {
  switch (contentType) {
    case "book":
      return "Book";

    case "manual":
      return "Manual";

    case "standard":
      return "Standard";

    case "note":
      return "Note";

    case "download":
      return "Download";

    default:
      return "Library Resource";
  }
}