import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCategoryBySlug,
} from "@/lib/categories";

import Article from "@/models/Article";

import {
  BookModel,
} from "@/models/Book";

import FormulaModel from "@/models/Formula";

export const runtime =
  "nodejs";

/* =========================================================
   TYPES
========================================================= */

type ResultType =
  | "article"
  | "library"
  | "formula";

type SearchResult = {
  id: string;

  title: string;
  slug: string;

  description: string;
  category: string;

  resultType:
    ResultType;

  typeLabel: string;

  href: string;

  author?: string;
  publisher?: string;

  coverImage?: string;

  resourceType?: string;
  contentType?: string;

  formulaText?: string;
  subDomain?: string;

  featured?: boolean;
  views?: number;

  createdAt?: string;

  relevance:
    number;
};

type ArticleDocument = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  category?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  views?: number;
  createdAt?: string;
};

type LibraryDocument = {
  _id: string;
  title: string;
  slug: string;

  author?: string;
  description?: string;

  category?: string;

  contentType?: string;
  resourceType?: string;

  publisher?: string;
  edition?: string;
  source?: string;

  coverImage?: string;

  featured?: boolean;
  views?: number;

  createdAt?: string;
};

type FormulaDocument = {
  _id: string;

  name: string;
  slug: string;

  domain?: string;
  subDomain?: string;

  description?: string;
  formulaText?: string;

  featured?: boolean;
  views?: number;

  createdAt?: string;
};

/* =========================================================
   HELPERS
========================================================= */

function escapeRegex(
  value: string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function normalizeText(
  value?: string
) {
  return (
    value || ""
  )
    .toLowerCase()
    .trim();
}

function getContentTypeLabel(
  contentType?: string
) {
  switch (
    contentType
  ) {
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

function calculateRelevance(
  query: string,
  fields: {
    title?: string;
    description?: string;
    category?: string;
    author?: string;
    publisher?: string;
    extra?: string;
  }
) {
  const normalizedQuery =
    normalizeText(
      query
    );

  if (
    !normalizedQuery
  ) {
    return 0;
  }

  const title =
    normalizeText(
      fields.title
    );

  const description =
    normalizeText(
      fields.description
    );

  const category =
    normalizeText(
      fields.category
    );

  const author =
    normalizeText(
      fields.author
    );

  const publisher =
    normalizeText(
      fields.publisher
    );

  const extra =
    normalizeText(
      fields.extra
    );

  let score =
    0;

  if (
    title ===
    normalizedQuery
  ) {
    score +=
      100;
  } else if (
    title.startsWith(
      normalizedQuery
    )
  ) {
    score +=
      70;
  } else if (
    title.includes(
      normalizedQuery
    )
  ) {
    score +=
      50;
  }

  if (
    category.includes(
      normalizedQuery
    )
  ) {
    score +=
      25;
  }

  if (
    author.includes(
      normalizedQuery
    )
  ) {
    score +=
      20;
  }

  if (
    publisher.includes(
      normalizedQuery
    )
  ) {
    score +=
      15;
  }

  if (
    description.includes(
      normalizedQuery
    )
  ) {
    score +=
      12;
  }

  if (
    extra.includes(
      normalizedQuery
    )
  ) {
    score +=
      10;
  }

  return score;
}

/* =========================================================
   FORMULA CATEGORY FILTER
========================================================= */

function getFormulaCategoryTerms(
  categoryName: string
) {
  const mapping:
    Record<
      string,
      string[]
    > = {
    HSE: [
      "hse",
      "safety",
      "health",
    ],

    "Oil & Gas": [
      "oil",
      "gas",
      "petroleum",
      "drilling",
      "reservoir",
      "production",
      "well",
    ],

    Mechanical: [
      "mechanical",
      "fluid",
      "piping",
      "pump",
      "hydraulic",
    ],

    Electrical: [
      "electrical",
      "power",
      "voltage",
      "current",
    ],

    Instrumentation: [
      "instrumentation",
      "instrument",
      "control",
      "measurement",
    ],

    Process: [
      "process",
      "chemical",
      "thermodynamic",
      "flow",
    ],

    Civil: [
      "civil",
      "construction",
      "structural",
    ],

    Geology: [
      "geology",
      "geological",
      "formation",
      "subsurface",
    ],
  };

  return (
    mapping[
      categoryName
    ] || [
      categoryName,
    ]
  );
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    await connectDB();

    const params =
      request.nextUrl
        .searchParams;

    const rawQuery =
      params
        .get("q")
        ?.trim() || "";

    const requestedType =
      params.get(
        "type"
      ) || "all";

    const requestedCategory =
      params.get(
        "category"
      ) || "all";

    const requestedContentType =
      params.get(
        "contentType"
      ) || "all";

    const allowedTypes =
      new Set([
        "all",
        "article",
        "library",
        "formula",
      ]);

    const allowedContentTypes =
      new Set([
        "all",
        "book",
        "manual",
        "standard",
        "note",
        "download",
      ]);

    const resultType =
      allowedTypes.has(
        requestedType
      )
        ? requestedType
        : "all";

    const contentType =
      allowedContentTypes.has(
        requestedContentType
      )
        ? requestedContentType
        : "all";

    const category =
      requestedCategory ===
        "all" ||
      getCategoryBySlug(
        requestedCategory
      )
        ? requestedCategory
        : "all";

    const categoryConfig =
      category !== "all"
        ? getCategoryBySlug(
            category
          )
        : null;

    /*
     * Limit query length to avoid
     * expensive regex searches.
     */
    const query =
      rawQuery.slice(
        0,
        100
      );

    const safeQuery =
      escapeRegex(
        query
      );

    const regex =
      query
        ? new RegExp(
            safeQuery,
            "i"
          )
        : null;

    /*
     * If there is no query and
     * no filter, return empty state.
     */
    const hasFilter =
      resultType !==
        "all" ||
      category !==
        "all" ||
      contentType !==
        "all";

    if (
      !query &&
      !hasFilter
    ) {
      return NextResponse.json({
        success:
          true,

        query:
          "",

        filters: {
          type:
            "all",

          category:
            "all",

          contentType:
            "all",
        },

        results:
          [],

        total:
          0,

        counts: {
          articles:
            0,

          library:
            0,

          formulas:
            0,
        },
      });
    }

    /* =====================================================
       ARTICLE FILTER
    ===================================================== */

    const articleFilter:
      Record<
        string,
        unknown
      > = {
      status:
        "Published",
    };

    if (
      categoryConfig
    ) {
      articleFilter.category =
        categoryConfig.name;
    }

    if (regex) {
      articleFilter.$or = [
        {
          title:
            regex,
        },

        {
          summary:
            regex,
        },

        {
          content:
            regex,
        },

        {
          category:
            regex,
        },

        {
          tags:
            regex,
        },

        {
          author:
            regex,
        },
      ];
    }

    /* =====================================================
       LIBRARY FILTER
    ===================================================== */

    const libraryFilter:
      Record<
        string,
        unknown
      > = {
      status:
        "Published",
    };

    if (
      categoryConfig
    ) {
      libraryFilter.category =
        categoryConfig.name;
    }

    if (
      contentType !==
      "all"
    ) {
      libraryFilter.contentType =
        contentType;
    }

    if (regex) {
      libraryFilter.$or = [
        {
          title:
            regex,
        },

        {
          author:
            regex,
        },

        {
          description:
            regex,
        },

        {
          category:
            regex,
        },

        {
          publisher:
            regex,
        },

        {
          edition:
            regex,
        },

        {
          source:
            regex,
        },
      ];
    }

    /* =====================================================
       FORMULA FILTER
    ===================================================== */

    const formulaConditions:
      Record<
        string,
        unknown
      >[] = [];

    if (regex) {
      formulaConditions.push({
        $or: [
          {
            name:
              regex,
          },

          {
            description:
              regex,
          },

          {
            domain:
              regex,
          },

          {
            subDomain:
              regex,
          },

          {
            formulaText:
              regex,
          },
        ],
      });
    }

    if (
      categoryConfig
    ) {
      const terms =
        getFormulaCategoryTerms(
          categoryConfig.name
        );

      const categoryRegex =
        new RegExp(
          terms
            .map(
              escapeRegex
            )
            .join("|"),
          "i"
        );

      formulaConditions.push({
        $or: [
          {
            domain:
              categoryRegex,
          },

          {
            subDomain:
              categoryRegex,
          },
        ],
      });
    }

    const formulaFilter:
      Record<
        string,
        unknown
      > = {
      status:
        "Published",

      verificationStatus:
        "verified",
    };

    if (
      formulaConditions.length >
      0
    ) {
      formulaFilter.$and =
        formulaConditions;
    }

    /* =====================================================
       DATABASE QUERIES
    ===================================================== */

    const [
      articleDocuments,
      libraryDocuments,
      formulaDocuments,

      articleCount,
      libraryCount,
      formulaCount,
    ] =
      await Promise.all([
        Article.find(
          articleFilter
        )
          .select(
            "_id title slug summary content category tags author featured views createdAt"
          )
          .sort({
            featured:
              -1,

            createdAt:
              -1,
          })
          .limit(
            50
          )
          .lean(),

        BookModel.find(
          libraryFilter
        )
          .select(
            "_id title slug author description category contentType resourceType publisher edition source coverImage featured views createdAt"
          )
          .sort({
            featured:
              -1,

            createdAt:
              -1,
          })
          .limit(
            50
          )
          .lean(),

        FormulaModel.find(
          formulaFilter
        )
          .select(
            "_id name slug domain subDomain description formulaText featured views createdAt"
          )
          .sort({
            featured:
              -1,

            createdAt:
              -1,
          })
          .limit(
            50
          )
          .lean(),

        Article.countDocuments(
          articleFilter
        ),

        BookModel.countDocuments(
          libraryFilter
        ),

        FormulaModel.countDocuments(
          formulaFilter
        ),
      ]);

    const articles =
      JSON.parse(
        JSON.stringify(
          articleDocuments
        )
      ) as ArticleDocument[];

    const library =
      JSON.parse(
        JSON.stringify(
          libraryDocuments
        )
      ) as LibraryDocument[];

    const formulas =
      JSON.parse(
        JSON.stringify(
          formulaDocuments
        )
      ) as FormulaDocument[];

    /* =====================================================
       NORMALIZE ARTICLES
    ===================================================== */

    const articleResults:
      SearchResult[] =
      articles.map(
        (
          article
        ) => ({
          id:
            String(
              article._id
            ),

          title:
            article.title,

          slug:
            article.slug,

          description:
            article.summary ||
            "",

          category:
            article.category ||
            "",

          resultType:
            "article",

          typeLabel:
            "Article",

          href:
            `/articles/${article.slug}`,

          author:
            article.author ||
            "",

          featured:
            Boolean(
              article.featured
            ),

          views:
            article.views ||
            0,

          createdAt:
            article.createdAt,

          relevance:
            calculateRelevance(
              query,
              {
                title:
                  article.title,

                description:
                  article.summary ||
                  article.content,

                category:
                  article.category,

                author:
                  article.author,

                extra:
                  article.tags?.join(
                    " "
                  ),
              }
            ),
        })
      );

    /* =====================================================
       NORMALIZE LIBRARY
    ===================================================== */

    const libraryResults:
      SearchResult[] =
      library.map(
        (
          resource
        ) => ({
          id:
            String(
              resource._id
            ),

          title:
            resource.title,

          slug:
            resource.slug,

          description:
            resource.description ||
            "",

          category:
            resource.category ||
            "",

          resultType:
            "library",

          typeLabel:
            getContentTypeLabel(
              resource.contentType
            ),

          href:
            `/library/${resource.slug}`,

          author:
            resource.author ||
            "",

          publisher:
            resource.publisher ||
            "",

          coverImage:
            resource.coverImage ||
            "",

          resourceType:
            resource.resourceType ||
            "",

          contentType:
            resource.contentType ||
            "",

          featured:
            Boolean(
              resource.featured
            ),

          views:
            resource.views ||
            0,

          createdAt:
            resource.createdAt,

          relevance:
            calculateRelevance(
              query,
              {
                title:
                  resource.title,

                description:
                  resource.description,

                category:
                  resource.category,

                author:
                  resource.author,

                publisher:
                  resource.publisher,

                extra:
                  [
                    resource.edition,
                    resource.source,
                    resource.contentType,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    ),
              }
            ),
        })
      );

    /* =====================================================
       NORMALIZE FORMULAS
    ===================================================== */

    const formulaResults:
      SearchResult[] =
      formulas.map(
        (
          formula
        ) => ({
          id:
            String(
              formula._id
            ),

          title:
            formula.name,

          slug:
            formula.slug,

          description:
            formula.description ||
            "",

          category:
            formula.domain ||
            "Engineering",

          resultType:
            "formula",

          typeLabel:
            "Formula",

          href:
            `/formulas/${formula.slug}`,

          formulaText:
            formula.formulaText ||
            "",

          subDomain:
            formula.subDomain ||
            "",

          featured:
            Boolean(
              formula.featured
            ),

          views:
            formula.views ||
            0,

          createdAt:
            formula.createdAt,

          relevance:
            calculateRelevance(
              query,
              {
                title:
                  formula.name,

                description:
                  formula.description,

                category:
                  formula.domain,

                extra:
                  [
                    formula.subDomain,
                    formula.formulaText,
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    ),
              }
            ),
        })
      );

    /* =====================================================
       TYPE FILTER
    ===================================================== */

    let combinedResults:
      SearchResult[] = [];

    if (
      resultType ===
      "article"
    ) {
      combinedResults =
        articleResults;
    } else if (
      resultType ===
      "library"
    ) {
      combinedResults =
        libraryResults;
    } else if (
      resultType ===
      "formula"
    ) {
      combinedResults =
        formulaResults;
    } else {
      combinedResults = [
        ...articleResults,
        ...libraryResults,
        ...formulaResults,
      ];
    }

    /* =====================================================
       RELEVANCE SORT
    ===================================================== */

    combinedResults.sort(
      (
        a,
        b
      ) => {
        if (
          b.relevance !==
          a.relevance
        ) {
          return (
            b.relevance -
            a.relevance
          );
        }

        if (
          Boolean(
            b.featured
          ) !==
          Boolean(
            a.featured
          )
        ) {
          return b.featured
            ? 1
            : -1;
        }

        if (
          (b.views ||
            0) !==
          (a.views ||
            0)
        ) {
          return (
            (b.views ||
              0) -
            (a.views ||
              0)
          );
        }

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

        return (
          dateB -
          dateA
        );
      }
    );

    const results =
      combinedResults.slice(
        0,
        60
      );

    const filteredTotal =
      resultType ===
      "article"
        ? articleCount
        : resultType ===
            "library"
          ? libraryCount
          : resultType ===
              "formula"
            ? formulaCount
            : articleCount +
              libraryCount +
              formulaCount;

    return NextResponse.json({
      success:
        true,

      query,

      filters: {
        type:
          resultType,

        category,

        contentType,
      },

      results,

      total:
        filteredTotal,

      counts: {
        articles:
          articleCount,

        library:
          libraryCount,

        formulas:
          formulaCount,
      },
    });
  } catch (error) {
    console.error(
      "Search API error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to complete search",

        results:
          [],

        total:
          0,

        counts: {
          articles:
            0,

          library:
            0,

          formulas:
            0,
        },
      },
      {
        status:
          500,
      }
    );
  }
}