"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import TechnicalMarkdown from "@/components/technical/TechnicalMarkdown";

/* =========================================================
   TYPES
========================================================= */

type AnswerMode =
  | "petrohub"
  | "web"
  | "hybrid";

type Citation = {
  title: string;
  url: string;
  domain: string;
};

type LocalSource = {
  title: string;
  slug: string;
};

type ChatMessage = {
  id: string;

  role:
    | "user"
    | "assistant";

  content: string;

  mode?: AnswerMode;

  citations?: Citation[];

  localSources?: LocalSource[];
};

type APIResponse = {
  success: boolean;

  answer?: string;

  message?: string;

  mode?: AnswerMode;

  usedWebSearch?: boolean;

  citations?: Citation[];

  localSources?: LocalSource[];
};

/* =========================================================
   SUGGESTIONS
========================================================= */

const suggestions = [
  "What is API gravity and how is it calculated?",

  "Calculate API gravity for specific gravity 0.85",

  "Explain hydrostatic pressure in drilling",

  "What is Reynolds number?",

  "Explain Bernoulli equation",

  "What is a three-phase separator?",
];

/* =========================================================
   SAFE CITATIONS
========================================================= */

function sanitizeCitations(
  citations:
    Citation[] | undefined
) {
  if (
    !Array.isArray(
      citations
    )
  ) {
    return [];
  }

  const unique =
    new Map<
      string,
      Citation
    >();

  for (
    const citation
    of citations
  ) {
    const url =
      typeof citation?.url ===
      "string"
        ? citation.url.trim()
        : "";

    if (!url) {
      continue;
    }

    try {
      const parsed =
        new URL(
          url
        );

      if (
        parsed.protocol !==
          "http:" &&
        parsed.protocol !==
          "https:"
      ) {
        continue;
      }

      const domain =
        (
          citation.domain ||
          parsed.hostname
        )
          .replace(
            /^www\./i,
            ""
          )
          .trim();

      const title =
        (
          citation.title ||
          domain
        ).trim();

      if (
        !unique.has(
          url
        )
      ) {
        unique.set(
          url,
          {
            title:
              title ||
              domain,

            url,

            domain,
          }
        );
      }
    } catch {
      continue;
    }
  }

  return Array.from(
    unique.values()
  );
}

/* =========================================================
   SAFE LOCAL SOURCES
========================================================= */

function sanitizeLocalSources(
  sources:
    LocalSource[] | undefined
) {
  if (
    !Array.isArray(
      sources
    )
  ) {
    return [];
  }

  const unique =
    new Map<
      string,
      LocalSource
    >();

  for (
    const source
    of sources
  ) {
    const title =
      typeof source?.title ===
      "string"
        ? source.title.trim()
        : "";

    const slug =
      typeof source?.slug ===
      "string"
        ? source.slug.trim()
        : "";

    if (
      !title ||
      !slug
    ) {
      continue;
    }

    if (
      !unique.has(
        slug
      )
    ) {
      unique.set(
        slug,
        {
          title,
          slug,
        }
      );
    }
  }

  return Array.from(
    unique.values()
  );
}

/* =========================================================
   CHAT COMPONENT
========================================================= */

export default function PetroHubAIChat() {
  const [
    messages,
    setMessages,
  ] =
    useState<
      ChatMessage[]
    >([]);

  const [
    question,
    setQuestion,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const chatEndRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(
    () => {
      chatEndRef.current?.scrollIntoView(
        {
          behavior:
            "smooth",

          block:
            "end",
        }
      );
    },
    [
      messages,
      loading,
      error,
    ]
  );

  /* =====================================================
     ASK AI
  ===================================================== */

  async function askQuestion(
    value?: string
  ) {
    const text =
      (
        value ??
        question
      ).trim();

    if (
      !text ||
      loading
    ) {
      return;
    }

    const userMessage:
      ChatMessage = {
      id:
        crypto.randomUUID(),

      role:
        "user",

      content:
        text,
    };

    const updatedMessages =
      [
        ...messages,
        userMessage,
      ];

    setMessages(
      updatedMessages
    );

    setQuestion(
      ""
    );

    setError(
      ""
    );

    setLoading(
      true
    );

    try {
      const response =
        await fetch(
          "/api/ai/chat",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                messages:
                  updatedMessages.map(
                    (
                      message
                    ) => ({
                      role:
                        message.role,

                      content:
                        message.content,
                    })
                  ),
              }),
          }
        );

      let data:
        APIResponse;

      try {
        data =
          (await response.json()) as APIResponse;
      } catch {
        throw new Error(
          "PetroHub AI returned an invalid response."
        );
      }

      if (
        !response.ok ||
        !data.success ||
        !data.answer
      ) {
        throw new Error(
          data.message ||
            "PetroHub AI is temporarily unavailable."
        );
      }

      const assistantMessage:
        ChatMessage = {
        id:
          crypto.randomUUID(),

        role:
          "assistant",

        content:
          data.answer,

        mode:
          data.mode,

        citations:
          sanitizeCitations(
            data.citations
          ),

        localSources:
          sanitizeLocalSources(
            data.localSources
          ),
      };

      setMessages(
        (
          current
        ) => [
          ...current,
          assistantMessage,
        ]
      );
    } catch (err) {
      console.error(
        "PetroHub AI chat error:",
        err
      );

      setError(
        err instanceof
          Error
          ? err.message
          : "PetroHub AI is temporarily unavailable."
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  /* =====================================================
     FORM SUBMIT
  ===================================================== */

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void askQuestion();
  }

  /* =====================================================
     CLEAR CHAT
  ===================================================== */

  function clearChat() {
    if (
      loading
    ) {
      return;
    }

    setMessages(
      []
    );

    setQuestion(
      ""
    );

    setError(
      ""
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-6 py-5 sm:px-8">
        <div>
          <p className="font-bold text-white">
            PetroHub AI
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Petroleum &
            Petrochemical Engineering
            Assistant
          </p>
        </div>

        {messages.length >
          0 && (
          <button
            type="button"
            onClick={
              clearChat
            }
            disabled={
              loading
            }
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            New Chat
          </button>
        )}
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {messages.length ===
        0 && (
        <div className="p-6 sm:p-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-slate-950">
              P
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
              Ask PetroHub AI
            </h2>

            <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-400">
              Ask technical
              questions, engineering
              concepts, formulas or
              calculations related to
              petroleum,
              petrochemical, fluid
              mechanics,
              thermodynamics and
              process engineering.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
            {suggestions.map(
              (
                suggestion
              ) => (
                <button
                  key={
                    suggestion
                  }
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    void askQuestion(
                      suggestion
                    )
                  }
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left text-sm font-medium leading-6 text-slate-300 transition hover:-translate-y-0.5 hover:border-orange-500/60 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {
                    suggestion
                  }
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* =================================================
          MESSAGES
      ================================================= */}

      {messages.length >
        0 && (
        <div className="max-h-[70vh] min-h-[420px] space-y-7 overflow-y-auto overflow-x-hidden p-5 sm:p-8">
          {messages.map(
            (
              message
            ) => (
              <div
                key={
                  message.id
                }
                className={
                  message.role ===
                  "user"
                    ? "ml-auto max-w-3xl"
                    : "mr-auto w-full max-w-4xl"
                }
              >
                {/* LABEL */}

                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {message.role ===
                  "user" ? (
                    <>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-300">
                        Y
                      </span>

                      You
                    </>
                  ) : (
                    <>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-slate-950">
                        P
                      </span>

                      PetroHub AI

                      {message.mode && (
                        <ModeBadge
                          mode={
                            message.mode
                          }
                        />
                      )}
                    </>
                  )}
                </div>

                {/* USER MESSAGE */}

                {message.role ===
                  "user" && (
                  <div className="whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-orange-500 px-5 py-4 font-medium leading-7 text-slate-950">
                    {
                      message.content
                    }
                  </div>
                )}

                {/* ASSISTANT MESSAGE */}

                {message.role ===
                  "assistant" && (
                  <div className="min-w-0 overflow-hidden rounded-2xl rounded-tl-md border border-slate-800 bg-slate-950 px-5 py-5 sm:px-6">
                    <TechnicalMarkdown
                      content={
                        message.content
                      }
                    />

                    {/* =====================================
                        PETROHUB INTERNAL SOURCES
                    ===================================== */}

                    {message
                      .localSources &&
                      message
                        .localSources
                        .length >
                        0 && (
                        <div className="mt-7 border-t border-slate-800 pt-5">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                            PetroHub
                            Knowledge
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {message
                              .localSources
                              .map(
                                (
                                  source
                                ) => (
                                  <Link
                                    key={
                                      source.slug
                                    }
                                    href={`/articles/${source.slug}`}
                                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
                                  >
                                    {
                                      source.title
                                    }
                                  </Link>
                                )
                              )}
                          </div>
                        </div>
                      )}

                    {/* =====================================
                        WEB CITATIONS
                    ===================================== */}

                    {message
                      .citations &&
                      message
                        .citations
                        .length >
                        0 && (
                        <div className="mt-7 border-t border-slate-800 pt-5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                              Sources
                            </p>

                            <span className="text-xs text-slate-600">
                              {
                                message
                                  .citations
                                  .length
                              }{" "}
                              referenced
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3">
                            {message
                              .citations
                              .map(
                                (
                                  citation,
                                  index
                                ) => (
                                  <a
                                    key={
                                      citation.url
                                    }
                                    href={
                                      citation.url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-orange-500/50"
                                  >
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-extrabold text-orange-400">
                                      {
                                        index +
                                        1
                                      }
                                    </span>

                                    <span className="min-w-0 flex-1">
                                      <span className="block break-words text-sm font-semibold leading-6 text-slate-200 transition group-hover:text-orange-300">
                                        {
                                          citation.title
                                        }
                                      </span>

                                      <span className="mt-1 block truncate text-xs text-slate-500">
                                        {
                                          citation.domain
                                        }
                                      </span>
                                    </span>

                                    <span
                                      aria-hidden="true"
                                      className="mt-1 shrink-0 text-slate-600 transition group-hover:text-orange-400"
                                    >
                                      ↗
                                    </span>
                                  </a>
                                )
                              )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="mr-auto w-full max-w-4xl">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-slate-950">
                  P
                </span>

                PetroHub AI
              </div>

              <div className="rounded-2xl rounded-tl-md border border-slate-800 bg-slate-950 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400" />

                    <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400 [animation-delay:150ms]" />

                    <span className="h-2 w-2 animate-pulse rounded-full bg-orange-400 [animation-delay:300ms]" />
                  </div>

                  <span className="text-sm font-medium text-slate-400">
                    Researching and
                    preparing your
                    answer...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div
            ref={
              chatEndRef
            }
          />
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mx-5 mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 sm:mx-8">
          <p className="font-semibold text-red-400">
            Unable to complete the
            request
          </p>

          <p className="mt-2 text-sm leading-6 text-red-300">
            {
              error
            }
          </p>
        </div>
      )}

      {/* =================================================
          INPUT
      ================================================= */}

      <div className="border-t border-slate-800 bg-slate-900/80 p-5 sm:p-6">
        <form
          onSubmit={
            handleSubmit
          }
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="petrohub-ai-question"
              className="sr-only"
            >
              Ask PetroHub AI
            </label>

            <textarea
              id="petrohub-ai-question"
              value={
                question
              }
              onChange={(
                event
              ) =>
                setQuestion(
                  event
                    .target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();

                  void askQuestion();
                }
              }}
              rows={
                2
              }
              disabled={
                loading
              }
              placeholder="Ask a petroleum or petrochemical engineering question..."
              className="min-h-[68px] w-full resize-none rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !question.trim()
            }
            className="min-h-[56px] rounded-2xl bg-orange-500 px-8 py-4 font-bold text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Thinking..."
              : "Ask"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-5 text-slate-400">
            Press Enter to send •
            Shift + Enter for a new
            line
          </p>

          <p className="text-xs leading-5 text-slate-400">
            Verify safety-critical
            and design calculations
            before field use.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MODE BADGE
========================================================= */

function ModeBadge({
  mode,
}: {
  mode: AnswerMode;
}) {
  const label:
    Record<
      AnswerMode,
      string
    > = {
    petrohub:
      "PetroHub",

    web:
      "Web Research",

    hybrid:
      "PetroHub + Web",
  };

  const style:
    Record<
      AnswerMode,
      string
    > = {
    petrohub:
      "border-slate-700 bg-slate-800 text-slate-300",

    web:
      "border-blue-500/20 bg-blue-500/10 text-blue-300",

    hybrid:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold normal-case tracking-normal ${style[mode]}`}
    >
      {
        label[
          mode
        ]
      }
    </span>
  );
}