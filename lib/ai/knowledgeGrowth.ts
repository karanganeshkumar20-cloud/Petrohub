import Article from "@/models/Article";

import {
  AIKnowledgeGapModel,
} from "@/models/AIKnowledgeGap";

import {
  AIQueryLogModel,
} from "@/models/AIQueryLog";

import {
  normalizeTechnicalMarkdown,
} from "@/lib/technicalMarkdown";

/* =========================================================
   TYPES
========================================================= */

type AIIntent =
  | "concept"
  | "formula"
  | "calculation"
  | "safety"
  | "other";

type AnswerMode =
  | "petrohub"
  | "web"
  | "hybrid";

export type AIResearchSource = {
  title: string;

  url: string;

  domain: string;

  sourceType:
    | "citation"
    | "web_search";
};

type KnowledgeGrowthInput = {
  userId: string;

  email?: string;

  question: string;

  answer: string;

  mode: AnswerMode;

  hadLocalSources: boolean;

  localSourceCount: number;

  usedWebSearch: boolean;

  researchSources?:
    AIResearchSource[];
};

/* =========================================================
   NORMALIZE QUESTION
========================================================= */

export function normalizeAIQuestion(
  question: string
) {
  return question
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s]/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

/* =========================================================
   DETECT INTENT
========================================================= */

export function detectAIIntent(
  question: string
): AIIntent {
  const text =
    normalizeAIQuestion(
      question
    );

  if (
    /\bcalculate\b|\bcalculation\b|\bcompute\b|\bsolve\b|\bdetermine\b/i.test(
      text
    )
  ) {
    return "calculation";
  }

  if (
    /\bformula\b|\bequation\b|\bcorrelation\b/i.test(
      text
    )
  ) {
    return "formula";
  }

  if (
    /\bsafety\b|\bhazard\b|\brisk\b|\bhira\b|\bhse\b|\bloto\b|\bptw\b|\bfire\b|\bh2s\b/i.test(
      text
    )
  ) {
    return "safety";
  }

  if (
    /\bwhat is\b|\bexplain\b|\bdefine\b|\bmeaning\b|\bhow does\b|\bwhy\b/i.test(
      text
    )
  ) {
    return "concept";
  }

  return "other";
}

/* =========================================================
   IGNORED WORDS
========================================================= */

const ignoredWords =
  new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "can",
    "do",
    "does",
    "for",
    "from",
    "how",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "please",
    "the",
    "this",
    "to",
    "use",
    "used",
    "using",
    "what",
    "when",
    "where",
    "which",
    "why",
    "with",
    "explain",
    "calculate",
    "calculation",
    "formula",
    "equation",
    "tell",
    "me",
  ]);

/* =========================================================
   TOPIC KEY
========================================================= */

export function createTopicKey(
  question: string
) {
  const normalized =
    normalizeAIQuestion(
      question
    );

  const words =
    normalized
      .split(" ")
      .filter(Boolean)
      .filter(
        (word) =>
          !ignoredWords.has(
            word
          )
      )
      .filter(
        (word) =>
          word.length >
          1
      );

  const uniqueWords =
    Array.from(
      new Set(words)
    );

  uniqueWords.sort();

  const key =
    uniqueWords
      .slice(0, 8)
      .join("-");

  return (
    key ||
    normalized
      .replace(
        /\s+/g,
        "-"
      )
      .slice(0, 80)
  );
}

/* =========================================================
   SLUG
========================================================= */

function slugify(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(0, 90);
}

/* =========================================================
   ESCAPE REGEX
========================================================= */

function escapeRegex(
  value: string
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

/* =========================================================
   ARTICLE TITLE
========================================================= */

function createDraftTitle(
  question: string
) {
  let title =
    question
      .trim()
      .replace(
        /\s+/g,
        " "
      )
      .replace(
        /[?.!]+$/,
        ""
      );

  title =
    title.replace(
      /^(what is|what are|explain|describe|define|tell me about)\s+/i,
      ""
    );

  if (!title) {
    return "Engineering Technical Guide";
  }

  return (
    title
      .charAt(0)
      .toUpperCase() +
    title.slice(1)
  );
}

/* =========================================================
   CLEAN RESEARCH OUTPUT
========================================================= */

function cleanResearchAnswer(
  answer: string
) {
  let content =
    answer || "";

  /*
    Remove Markdown external links
    from article draft while preserving
    visible link text.
  */

  content =
    content.replace(
      /\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi,
      "$1"
    );

  /*
    Remove bare external URLs
    from article draft.
  */

  content =
    content.replace(
      /https?:\/\/[^\s)>]+/gi,
      ""
    );

  content =
    content.replace(
      /\bwww\.[^\s)>]+/gi,
      ""
    );

  /*
    Remove domain-only references.
  */

  content =
    content.replace(
      /\(\s*(?:www\.)?[a-z0-9.-]+\.(?:com|org|net|edu|gov|io|co|in|uk)[^)]*\)/gi,
      ""
    );

  /*
    Remove simple citation numbering.
  */

  content =
    content.replace(
      /\[(?:\d{1,3})(?:\s*,\s*\d{1,3})*\]/g,
      ""
    );

  /*
    Remove API citation markers
    from article draft.
  */

  content =
    content.replace(
      /【[^】]+】/g,
      ""
    );

  content =
    content.replace(
      /\(\s*\)/g,
      ""
    );

  content =
    content.replace(
      /\n{3,}/g,
      "\n\n"
    );

  return content.trim();
}

/* =========================================================
   ARTICLE CONTENT
========================================================= */

function prepareArticleContent(
  answer: string
) {
  const cleaned =
    cleanResearchAnswer(
      answer
    );

  return normalizeTechnicalMarkdown(
    cleaned
  );
}

/* =========================================================
   SUMMARY
========================================================= */

function createSummary(
  content: string
) {
  let text =
    content;

  text =
    text.replace(
      /\$\$[\s\S]*?\$\$/g,
      " "
    );

  text =
    text.replace(
      /\$([^$]+)\$/g,
      "$1"
    );

  text =
    text
      .replace(
        /#{1,6}\s*/g,
        ""
      )
      .replace(
        /\*\*/g,
        ""
      )
      .replace(
        /__/g,
        ""
      )
      .replace(
        /[`>*]/g,
        " "
      )
      .replace(
        /\\[A-Za-z]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (
    text.length <=
    220
  ) {
    return text;
  }

  const shortened =
    text.slice(
      0,
      217
    );

  const lastSpace =
    shortened.lastIndexOf(
      " "
    );

  const finalText =
    lastSpace >
    150
      ? shortened.slice(
          0,
          lastSpace
        )
      : shortened;

  return `${finalText}...`;
}

/* =========================================================
   TAGS
========================================================= */

function createTags(
  question: string
) {
  const words =
    normalizeAIQuestion(
      question
    )
      .split(" ")
      .filter(Boolean)
      .filter(
        (word) =>
          !ignoredWords.has(
            word
          )
      )
      .filter(
        (word) =>
          word.length >=
          3
      );

  return Array.from(
    new Set(words)
  )
    .slice(0, 7)
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1)
    );
}

/* =========================================================
   CATEGORY
========================================================= */

function determineCategory(
  question: string
) {
  const text =
    normalizeAIQuestion(
      question
    );

  if (
    /\bsafety\b|\bhazard\b|\brisk\b|\bhira\b|\bhse\b|\bh2s\b|\bloto\b|\bptw\b|\bconfined\b|\bfire\b/i.test(
      text
    )
  ) {
    return "HSE";
  }

  if (
    /\brefinery\b|\brefining\b|\bpetrochemical\b|\bprocess\b|\bdistillation\b|\bheat exchanger\b|\bthermodynamic\b|\benthalpy\b|\bentropy\b|\breynolds\b|\bbernoulli\b|\bpressure drop\b|\bheat transfer\b|\bnelson\b|\bsolomon\b|\bdesalting\b/i.test(
      text
    )
  ) {
    return "Process";
  }

  if (
    /\bgeology\b|\bformation\b|\bporosity\b|\bpermeability\b|\blithology\b|\bpetrophysics\b/i.test(
      text
    )
  ) {
    return "Geology";
  }

  if (
    /\bdrilling\b|\breservoir\b|\bproduction\b|\bwell\b|\bapi gravity\b|\bcrude\b|\bpetroleum\b|\boil\b|\bgas\b/i.test(
      text
    )
  ) {
    return "Oil & Gas";
  }

  return "Engineering";
}

/* =========================================================
   UNIQUE SLUG
========================================================= */

async function createUniqueSlug(
  title: string
) {
  const baseSlug =
    slugify(
      title
    ) ||
    `petrohub-${Date.now()}`;

  let slug =
    baseSlug;

  let counter =
    2;

  while (
    await Article.exists({
      slug,
    })
  ) {
    slug =
      `${baseSlug}-${counter}`;

    counter +=
      1;
  }

  return slug;
}

/* =========================================================
   NORMALIZE RESEARCH SOURCE
========================================================= */

function normalizeSource(
  source:
    AIResearchSource
):
  AIResearchSource | null {
  const url =
    source.url?.trim();

  if (
    !url ||
    !/^https?:\/\//i.test(
      url
    )
  ) {
    return null;
  }

  let domain =
    source.domain?.trim() ||
    "";

  try {
    domain =
      new URL(
        url
      )
        .hostname
        .replace(
          /^www\./i,
          ""
        );
  } catch {
    return null;
  }

  return {
    title:
      source.title?.trim() ||
      domain,

    url,

    domain,

    sourceType:
      source.sourceType ===
      "citation"
        ? "citation"
        : "web_search",
  };
}

/* =========================================================
   KNOWLEDGE GAP
========================================================= */

async function upsertKnowledgeGap({
  topicKey,
  question,
  intent,
  answerPreview,
}: {
  topicKey: string;

  question: string;

  intent: AIIntent;

  answerPreview: string;
}) {
  return AIKnowledgeGapModel.findOneAndUpdate(
    {
      topicKey,
    },

    {
      $set: {
        latestQuestion:
          question,

        intent,

        latestAnswerPreview:
          answerPreview,

        researchOrigin:
          "petrohub_research",
      },

      $setOnInsert: {
        topicKey,

        exampleQuestion:
          question,

        status:
          "needs_review",
      },

      $inc: {
        hitCount:
          1,
      },
    },

    {
      new:
        true,

      upsert:
        true,

      setDefaultsOnInsert:
        false,
    }
  );
}

/* =========================================================
   MERGE PRIVATE RESEARCH SOURCES
========================================================= */

async function mergeResearchSources({
  gap,
  researchSources,
}: {
  gap: any;

  researchSources:
    AIResearchSource[];
}) {
  if (
    !gap ||
    !Array.isArray(
      researchSources
    ) ||
    researchSources.length ===
      0
  ) {
    return;
  }

  const existingSources:
    any[] =
    Array.isArray(
      gap.researchSources
    )
      ? gap.researchSources
      : [];

  const sourceMap =
    new Map<
      string,
      any
    >();

  for (
    const existing
    of existingSources
  ) {
    const url =
      String(
        existing?.url ||
          ""
      ).trim();

    if (!url) {
      continue;
    }

    sourceMap.set(
      url,
      {
        title:
          existing.title ||
          "",

        url,

        domain:
          existing.domain ||
          "",

        sourceType:
          existing.sourceType ||
          "web_search",

        verified:
          Boolean(
            existing.verified
          ),

        capturedAt:
          existing.capturedAt ||
          new Date(),
      }
    );
  }

  for (
    const rawSource
    of researchSources
  ) {
    const source =
      normalizeSource(
        rawSource
      );

    if (!source) {
      continue;
    }

    const existing =
      sourceMap.get(
        source.url
      );

    if (existing) {
      sourceMap.set(
        source.url,
        {
          ...existing,

          title:
            source.title ||
            existing.title,

          domain:
            source.domain ||
            existing.domain,

          /*
            Citation is more specific
            than a generic search source.
          */

          sourceType:
            source.sourceType ===
            "citation"
              ? "citation"
              : existing.sourceType,

          /*
            Never reset manually
            verified sources.
          */

          verified:
            Boolean(
              existing.verified
            ),
        }
      );

      continue;
    }

    sourceMap.set(
      source.url,
      {
        ...source,

        verified:
          false,

        capturedAt:
          new Date(),
      }
    );
  }

  gap.researchSources =
    Array.from(
      sourceMap.values()
    ).slice(
      0,
      60
    );

  await gap.save();
}

/* =========================================================
   CREATE ARTICLE DRAFT
========================================================= */

async function ensureArticleDraft({
  gap,
  question,
  answer,
}: {
  gap: any;

  question: string;

  answer: string;
}) {
  if (
    gap?.draftArticleId
  ) {
    const linkedArticle =
      await Article.findById(
        gap.draftArticleId
      )
        .select("_id")
        .lean();

    if (
      linkedArticle
    ) {
      return;
    }

    gap.draftArticleId =
      undefined;

    await gap.save();
  }

  const title =
    createDraftTitle(
      question
    );

  const existingDraft =
    await Article.findOne({
      title: {
        $regex:
          `^${escapeRegex(
            title
          )}$`,

        $options:
          "i",
      },

      status:
        "Draft",
    });

  if (
    existingDraft
  ) {
    gap.draftArticleId =
      existingDraft._id;

    await gap.save();

    return;
  }

  const content =
    prepareArticleContent(
      answer
    );

  if (
    !content
  ) {
    return;
  }

  const slug =
    await createUniqueSlug(
      title
    );

  const article =
    await Article.create({
      title,

      slug,

      summary:
        createSummary(
          content
        ),

      content,

      category:
        determineCategory(
          question
        ),

      tags:
        createTags(
          question
        ),

      featuredImage:
        "",

      source:
        "PetroHub",

      sourceUrl:
        "",

      license:
        "Original Content",

      author:
        "PetroHub Team",

      status:
        "Draft",

      featured:
        false,

      views:
        0,
    });

  gap.draftArticleId =
    article._id;

  gap.status =
    "needs_review";

  await gap.save();

  console.log(
    "PetroHub AI draft created:",
    article.title
  );
}

/* =========================================================
   MAIN PIPELINE
========================================================= */

export async function persistAIKnowledgeGrowth({
  userId,
  email = "",
  question,
  answer,
  mode,
  hadLocalSources,
  localSourceCount,
  usedWebSearch,
  researchSources = [],
}: KnowledgeGrowthInput) {
  try {
    const normalizedQuestion =
      normalizeAIQuestion(
        question
      );

    const intent =
      detectAIIntent(
        question
      );

    const articleContent =
      prepareArticleContent(
        answer
      );

    /* =====================================================
       QUERY LOG
    ===================================================== */

    await AIQueryLogModel.create({
      userId,

      email,

      question,

      normalizedQuestion,

      intent,

      mode,

      hadLocalSources,

      localSourceCount,

      usedWebSearch,

      answerPreview:
        createSummary(
          articleContent
        ),
    });

    /* =====================================================
       EMPTY ANSWER
    ===================================================== */

    if (
      !answer.trim()
    ) {
      return;
    }

    /* =====================================================
       WEB / HYBRID RESEARCH
    ===================================================== */

    const researchBacked =
      usedWebSearch ||
      mode === "web" ||
      mode === "hybrid";

    if (
      !researchBacked
    ) {
      console.log(
        "PetroHub AI draft skipped: local-only answer"
      );

      return;
    }

    /* =====================================================
       KNOWLEDGE GAP
    ===================================================== */

    const topicKey =
      createTopicKey(
        question
      );

    const gap =
      await upsertKnowledgeGap({
        topicKey,

        question,

        intent,

        answerPreview:
          createSummary(
            articleContent
          ),
      });

    if (!gap) {
      return;
    }

    /* =====================================================
       PRIVATE PROVENANCE
    ===================================================== */

    await mergeResearchSources({
      gap,

      researchSources,
    });

    /* =====================================================
       ARTICLE DRAFT
    ===================================================== */

    await ensureArticleDraft({
      gap,

      question,

      answer,
    });
  } catch (error) {
    /*
      Knowledge growth failure must
      never stop the AI response.
    */

    console.error(
      "PetroHub AI knowledge growth error:",
      error
    );
  }
}