"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

type DraftArticle = {
  _id: string;

  title: string;

  slug: string;

  status: string;

  category?: string;

  createdAt?: string;

  updatedAt?: string;
};

type ResearchSource = {
  title: string;

  url: string;

  domain: string;

  sourceType:
    | "citation"
    | "web_search";

  verified: boolean;

  capturedAt?: string;
};

type KnowledgeGap = {
  _id: string;

  topicKey: string;

  exampleQuestion:
    string;

  latestQuestion:
    string;

  intent:
    | "concept"
    | "formula"
    | "calculation"
    | "safety"
    | "other";

  hitCount: number;

  latestAnswerPreview?:
    string;

  status:
    | "needs_review"
    | "reviewing"
    | "published"
    | "rejected";

  researchOrigin?:
    string;

  researchSources?:
    ResearchSource[];

  draftArticleId?:
    | DraftArticle
    | null;

  createdAt?: string;

  updatedAt?: string;
};

type Stats = {
  total: number;

  needsReview: number;

  reviewing: number;

  rejected: number;

  totalQuestions: number;

  drafts: number;

  sources: number;

  verifiedSources:
    number;
};

type APIResponse = {
  success: boolean;

  message?: string;

  gaps?:
    KnowledgeGap[];

  stats?: Stats;

  gap?:
    KnowledgeGap;
};

const emptyStats: Stats = {
  total:
    0,

  needsReview:
    0,

  reviewing:
    0,

  rejected:
    0,

  totalQuestions:
    0,

  drafts:
    0,

  sources:
    0,

  verifiedSources:
    0,
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AIContentInbox() {
  const [
    gaps,
    setGaps,
  ] =
    useState<
      KnowledgeGap[]
    >([]);

  const [
    stats,
    setStats,
  ] =
    useState<Stats>(
      emptyStats
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    updatingId,
    setUpdatingId,
  ] =
    useState("");

  const [
    sourceUpdatingKey,
    setSourceUpdatingKey,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");

  const [
    intentFilter,
    setIntentFilter,
  ] =
    useState("all");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  async function loadData() {
    try {
      setLoading(
        true
      );

      setError(
        ""
      );

      const response =
        await fetch(
          "/api/admin/ai-content",
          {
            cache:
              "no-store",
          }
        );

      const data =
        (await response.json()) as APIResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to load knowledge growth inbox."
        );
      }

      setGaps(
        data.gaps ||
          []
      );

      setStats(
        data.stats ||
          emptyStats
      );
    } catch (err) {
      setError(
        err instanceof
          Error
          ? err.message
          : "Unable to load content."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  useEffect(
    () => {
      void loadData();
    },
    []
  );

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredGaps =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return gaps.filter(
          (
            gap
          ) => {
            if (
              statusFilter !==
                "all" &&
              gap.status !==
                statusFilter
            ) {
              return false;
            }

            if (
              intentFilter !==
                "all" &&
              gap.intent !==
                intentFilter
            ) {
              return false;
            }

            if (!query) {
              return true;
            }

            const sourceText =
              (
                gap
                  .researchSources ||
                []
              )
                .map(
                  (
                    source
                  ) =>
                    `${source.title} ${source.domain} ${source.url}`
                )
                .join(
                  " "
                );

            const searchable = [
              gap
                .exampleQuestion,

              gap
                .latestQuestion,

              gap.topicKey,

              gap.intent,

              gap
                .draftArticleId
                ?.title ||
                "",

              sourceText,
            ]
              .join(
                " "
              )
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );
      },
      [
        gaps,
        search,
        statusFilter,
        intentFilter,
      ]
    );

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  async function updateStatus(
    id: string,

    status:
      KnowledgeGap["status"]
  ) {
    try {
      setUpdatingId(
        id
      );

      setError(
        ""
      );

      const response =
        await fetch(
          "/api/admin/ai-content",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                id,

                status,
              }),
          }
        );

      const data =
        (await response.json()) as APIResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.gap
      ) {
        throw new Error(
          data.message ||
            "Unable to update status."
        );
      }

      setGaps(
        (
          current
        ) =>
          current.map(
            (
              gap
            ) =>
              gap._id ===
              id
                ? data.gap!
                : gap
          )
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof
          Error
          ? err.message
          : "Unable to update content."
      );
    } finally {
      setUpdatingId(
        ""
      );
    }
  }

  /* =====================================================
     VERIFY SOURCE
  ===================================================== */

  async function updateSourceVerification({
    gapId,
    source,
    verified,
  }: {
    gapId: string;

    source:
      ResearchSource;

    verified: boolean;
  }) {
    const key =
      `${gapId}:${source.url}`;

    try {
      setSourceUpdatingKey(
        key
      );

      setError(
        ""
      );

      const response =
        await fetch(
          "/api/admin/ai-content",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                action:
                  "verify_source",

                id:
                  gapId,

                sourceUrl:
                  source.url,

                verified,
              }),
          }
        );

      const data =
        (await response.json()) as APIResponse;

      if (
        !response.ok ||
        !data.success ||
        !data.gap
      ) {
        throw new Error(
          data.message ||
            "Unable to update source verification."
        );
      }

      setGaps(
        (
          current
        ) =>
          current.map(
            (
              gap
            ) =>
              gap._id ===
              gapId
                ? data.gap!
                : gap
          )
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof
          Error
          ? err.message
          : "Unable to update source."
      );
    } finally {
      setSourceUpdatingKey(
        ""
      );
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (
    loading
  ) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <p className="font-semibold text-slate-300">
          Loading knowledge
          growth inbox...
        </p>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-8">
      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard
          label="Knowledge Gaps"
          value={
            stats.total
          }
        />

        <StatCard
          label="Needs Review"
          value={
            stats
              .needsReview
          }
        />

        <StatCard
          label="Questions"
          value={
            stats
              .totalQuestions
          }
        />

        <StatCard
          label="Drafts Created"
          value={
            stats.drafts
          }
        />

        <StatCard
          label="Reviewing"
          value={
            stats.reviewing
          }
        />

        <StatCard
          label="Research Sources"
          value={
            stats.sources
          }
        />

        <StatCard
          label="Verified Sources"
          value={
            stats
              .verifiedSources
          }
        />
      </div>

      {/* FILTERS */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event
                  .target
                  .value
              )
            }
            placeholder="Search questions, topics, draft articles or research sources..."
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
          />

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event
                  .target
                  .value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
          >
            <option value="all">
              All statuses
            </option>

            <option value="needs_review">
              Needs Review
            </option>

            <option value="reviewing">
              Reviewing
            </option>

            <option value="published">
              Published
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>

          <select
            value={
              intentFilter
            }
            onChange={(
              event
            ) =>
              setIntentFilter(
                event
                  .target
                  .value
              )
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
          >
            <option value="all">
              All intents
            </option>

            <option value="concept">
              Concept
            </option>

            <option value="formula">
              Formula
            </option>

            <option value="calculation">
              Calculation
            </option>

            <option value="safety">
              Safety
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {
                filteredGaps
                  .length
              }
            </span>{" "}
            topics
          </p>

          <button
            type="button"
            onClick={() =>
              void loadData()
            }
            className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {
            error
          }
        </div>
      )}

      {/* EMPTY */}

      {filteredGaps
        .length ===
        0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h2 className="text-xl font-bold">
            No matching knowledge
            gaps
          </h2>

          <p className="mt-3 text-slate-400">
            New researched topics
            will appear here for
            admin review.
          </p>
        </div>
      )}

      {/* GAP CARDS */}

      <div className="space-y-5">
        {filteredGaps.map(
          (
            gap
          ) => {
            const sources =
              gap
                .researchSources ||
              [];

            const verifiedCount =
              sources.filter(
                (
                  source
                ) =>
                  source
                    .verified
              ).length;

            return (
              <article
                key={
                  gap._id
                }
                className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7"
              >
                {/* TOP */}

                <div className="flex flex-col justify-between gap-5 lg:flex-row">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <IntentBadge
                        intent={
                          gap.intent
                        }
                      />

                      <StatusBadge
                        status={
                          gap.status
                        }
                      />

                      <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
                        {
                          gap
                            .hitCount
                        }{" "}
                        {gap
                          .hitCount ===
                        1
                          ? "question"
                          : "questions"}
                      </span>

                      {sources.length >
                        0 && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                          {
                            verifiedCount
                          }
                          /
                          {
                            sources.length
                          }{" "}
                          sources verified
                        </span>
                      )}
                    </div>

                    <h2 className="mt-5 text-xl font-bold leading-8 text-white">
                      {
                        gap
                          .latestQuestion
                      }
                    </h2>

                    {gap
                      .exampleQuestion !==
                      gap
                        .latestQuestion && (
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        First
                        question:{" "}
                        {
                          gap
                            .exampleQuestion
                        }
                      </p>
                    )}
                  </div>

                  {/* DEMAND */}

                  <div className="shrink-0 rounded-2xl border border-orange-500/20 bg-orange-500/5 px-5 py-4 lg:min-w-[150px]">
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      Demand
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-white">
                      {
                        gap
                          .hitCount
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      related
                      questions
                    </p>
                  </div>
                </div>

                {/* ANSWER PREVIEW */}

                {gap
                  .latestAnswerPreview && (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Latest Answer
                      Preview
                    </p>

                    <p className="mt-3 leading-7 text-slate-300">
                      {
                        gap
                          .latestAnswerPreview
                      }
                    </p>
                  </div>
                )}

                {/* PRIVATE RESEARCH SOURCES */}

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Private Research
                        Sources
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Admin-only
                        provenance for
                        review before
                        publishing.
                      </p>
                    </div>

                    {sources.length >
                      0 && (
                      <span className="text-xs font-semibold text-slate-400">
                        {
                          verifiedCount
                        }{" "}
                        verified of{" "}
                        {
                          sources.length
                        }
                      </span>
                    )}
                  </div>

                  {sources.length ===
                  0 ? (
                    <p className="mt-4 text-sm text-slate-500">
                      No web research
                      sources captured
                      for this topic.
                    </p>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {sources.map(
                        (
                          source,
                          index
                        ) => {
                          const sourceKey =
                            `${gap._id}:${source.url}`;

                          const updating =
                            sourceUpdatingKey ===
                            sourceKey;

                          return (
                            <div
                              key={`${source.url}-${index}`}
                              className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                            >
                              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <SourceTypeBadge
                                      sourceType={
                                        source
                                          .sourceType
                                      }
                                    />

                                    {source
                                      .verified ? (
                                      <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300">
                                        Verified
                                      </span>
                                    ) : (
                                      <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-300">
                                        Not verified
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-3 break-words font-semibold text-white">
                                    {
                                      source
                                        .title ||
                                      source
                                        .domain
                                    }
                                  </p>

                                  <p className="mt-1 break-all text-xs text-slate-500">
                                    {
                                      source
                                        .domain
                                    }
                                  </p>

                                  {source
                                    .capturedAt && (
                                    <p className="mt-2 text-xs text-slate-600">
                                      Captured{" "}
                                      {
                                        formatDate(
                                          source
                                            .capturedAt
                                        )
                                      }
                                    </p>
                                  )}
                                </div>

                                <div className="flex shrink-0 flex-wrap gap-2">
                                  <a
                                    href={
                                      source
                                        .url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
                                  >
                                    Open Source
                                  </a>

                                  <button
                                    type="button"
                                    disabled={
                                      updating
                                    }
                                    onClick={() =>
                                      void updateSourceVerification({
                                        gapId:
                                          gap._id,

                                        source,

                                        verified:
                                          !source
                                            .verified,
                                      })
                                    }
                                    className={
                                      source
                                        .verified
                                        ? "rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-yellow-500 hover:text-yellow-300 disabled:opacity-50"
                                        : "rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 disabled:opacity-50"
                                    }
                                  >
                                    {updating
                                      ? "Updating..."
                                      : source
                                          .verified
                                        ? "Unverify"
                                        : "Verify Source"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* DRAFT */}

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Article Draft
                  </p>

                  {gap
                    .draftArticleId ? (
                    <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold text-white">
                          {
                            gap
                              .draftArticleId
                              .title
                          }
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                          {gap
                            .draftArticleId
                            .category && (
                            <span>
                              {
                                gap
                                  .draftArticleId
                                  .category
                              }
                            </span>
                          )}

                          <span>
                            •
                          </span>

                          <span>
                            {
                              gap
                                .draftArticleId
                                .status
                            }
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/admin/articles/edit/${gap.draftArticleId._id}`}
                          className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-orange-400"
                        >
                          Review Draft
                        </Link>

                        {gap
                          .draftArticleId
                          .status ===
                          "Published" && (
                          <Link
                            href={`/articles/${gap.draftArticleId.slug}`}
                            target="_blank"
                            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
                          >
                            View Article
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      No linked article
                      draft.
                    </p>
                  )}
                </div>

                {/* ACTIONS */}

                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-6">
                  {gap.status !==
                    "reviewing" && (
                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        gap._id
                      }
                      onClick={() =>
                        void updateStatus(
                          gap._id,
                          "reviewing"
                        )
                      }
                      className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
                    >
                      Mark Reviewing
                    </button>
                  )}

                  {gap.status !==
                    "needs_review" && (
                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        gap._id
                      }
                      onClick={() =>
                        void updateStatus(
                          gap._id,
                          "needs_review"
                        )
                      }
                      className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400 disabled:opacity-50"
                    >
                      Needs Review
                    </button>
                  )}

                  {gap.status !==
                    "rejected" && (
                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        gap._id
                      }
                      onClick={() =>
                        void updateStatus(
                          gap._id,
                          "rejected"
                        )
                      }
                      className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Reject Topic
                    </button>
                  )}

                  {updatingId ===
                    gap._id && (
                    <span className="flex items-center text-sm text-slate-400">
                      Updating...
                    </span>
                  )}

                  <span className="ml-auto self-center text-xs text-slate-500">
                    Updated{" "}
                    {
                      formatDate(
                        gap.updatedAt
                      )
                    }
                  </span>
                </div>
              </article>
            );
          }
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
}: {
  label: string;

  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm font-medium text-slate-400">
        {
          label
        }
      </p>

      <p className="mt-3 text-3xl font-extrabold text-white">
        {
          value
            .toLocaleString()
        }
      </p>
    </div>
  );
}

/* =========================================================
   INTENT BADGE
========================================================= */

function IntentBadge({
  intent,
}: {
  intent:
    KnowledgeGap["intent"];
}) {
  const labels:
    Record<
      KnowledgeGap["intent"],
      string
    > = {
    concept:
      "Concept",

    formula:
      "Formula",

    calculation:
      "Calculation",

    safety:
      "Safety",

    other:
      "Other",
  };

  return (
    <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
      {
        labels[
          intent
        ]
      }
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status:
    KnowledgeGap["status"];
}) {
  const labels:
    Record<
      KnowledgeGap["status"],
      string
    > = {
    needs_review:
      "Needs Review",

    reviewing:
      "Reviewing",

    published:
      "Published",

    rejected:
      "Rejected",
  };

  const styles:
    Record<
      KnowledgeGap["status"],
      string
    > = {
    needs_review:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",

    reviewing:
      "border-blue-500/20 bg-blue-500/10 text-blue-300",

    published:
      "border-green-500/20 bg-green-500/10 text-green-300",

    rejected:
      "border-red-500/20 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {
        labels[
          status
        ]
      }
    </span>
  );
}

/* =========================================================
   SOURCE TYPE BADGE
========================================================= */

function SourceTypeBadge({
  sourceType,
}: {
  sourceType:
    ResearchSource["sourceType"];
}) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300">
      {sourceType ===
      "citation"
        ? "Cited Source"
        : "Web Research"}
    </span>
  );
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value?: string
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );
}