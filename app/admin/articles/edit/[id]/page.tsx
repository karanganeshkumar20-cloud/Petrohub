"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";

type PublicationStatus =
  | "Draft"
  | "Published";

type ArticleForm = {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  status:
    PublicationStatus;
  featuredImage: string;
  source: string;
  sourceUrl: string;
  license: string;
  author: string;
  featured: boolean;
};

const categories = [
  "HSE",
  "Oil & Gas",
  "Mechanical",
  "Civil",
  "Electrical",
  "Instrumentation",
  "Process",
  "Geology",
];

const initialForm: ArticleForm = {
  title: "",
  summary: "",
  content: "",
  category: "",
  tags: "",
  status: "Draft",
  featuredImage: "",
  source: "PetroHub",
  sourceUrl: "",
  license: "",
  author: "PetroHub Team",
  featured: false,
};

export default function EditArticlePage() {
  const params =
    useParams();

  const router =
    useRouter();

  const rawArticleId =
    params.id;

  const articleId =
    Array.isArray(
      rawArticleId
    )
      ? rawArticleId[0]
      : String(
          rawArticleId ||
            ""
        );

  const [
    form,
    setForm,
  ] =
    useState<ArticleForm>(
      initialForm
    );

  const [
    pageLoading,
    setPageLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  useEffect(() => {
    async function fetchArticle() {
      try {
        setPageLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/articles/${articleId}`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Article not found"
          );
        }

        const article =
          data.article;

        setForm({
          title:
            article.title ||
            "",

          summary:
            article.summary ||
            "",

          content:
            article.content ||
            "",

          category:
            article.category ||
            "",

          tags:
            Array.isArray(
              article.tags
            )
              ? article.tags.join(
                  ", "
                )
              : "",

          status:
            article.status ===
            "Published"
              ? "Published"
              : "Draft",

          featuredImage:
            article.featuredImage ||
            "",

          source:
            article.source ||
            "PetroHub",

          sourceUrl:
            article.sourceUrl ||
            "",

          license:
            article.license ||
            "",

          author:
            article.author ||
            "PetroHub Team",

          featured:
            Boolean(
              article.featured
            ),
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load article"
        );
      } finally {
        setPageLoading(false);
      }
    }

    if (
      articleId
    ) {
      void fetchArticle();
    }
  }, [
    articleId,
  ]);

  function updateField<
    K extends keyof ArticleForm
  >(
    field: K,
    value: ArticleForm[K]
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  }

  function validateForm() {
    if (
      !form.title.trim()
    ) {
      return "Title is required.";
    }

    if (
      !form.category.trim()
    ) {
      return "Category is required.";
    }

    if (
      !form.content.trim()
    ) {
      return "Article content is required.";
    }

    return "";
  }

  async function updateArticle() {
    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setError(
        validationError
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `/api/articles/${articleId}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ...form,

                tags:
                  form.tags
                    .split(",")
                    .map(
                      (
                        tag
                      ) =>
                        tag.trim()
                    )
                    .filter(
                      Boolean
                    ),
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to update article"
        );
      }

      setMessage(
        "Article updated successfully."
      );

      router.push(
        "/admin/articles"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update article"
      );
    } finally {
      setSaving(false);
    }
  }

  if (
    pageLoading
  ) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
            Loading article...
          </div>
        </div>
      </main>
    );
  }

  if (
    error &&
    !form.title
  ) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8">
          <h1 className="text-2xl font-bold text-red-300">
            Unable to load
            article
          </h1>

          <p className="mt-3 text-sm text-red-200">
            {error}
          </p>

          <Link
            href="/admin/articles"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
          >
            Back to Articles
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-orange-500">
              PetroHub CMS
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Edit Article
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Update article
              content, publication
              state and metadata.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {form.status ===
              "Published" && (
              <Link
                href={`/articles/${articleId}`}
                className="hidden"
              >
                View
              </Link>
            )}

            <Link
              href="/admin/articles"
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500 hover:text-white"
            >
              Back to Articles
            </Link>
          </div>
        </div>

        <form
          onSubmit={(
            event
          ) => {
            event.preventDefault();

            void updateArticle();
          }}
          className="mt-10 space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8"
        >
          {/* BASIC */}

          <SectionTitle
            title="Article Information"
            description="Edit the article title, category, summary and tags."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Field>
              <FieldLabel>
                Article Title
              </FieldLabel>

              <input
                type="text"
                value={
                  form.title
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "title",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                Category
              </FieldLabel>

              <select
                value={
                  form.category
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "category",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (
                    category
                  ) => (
                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>

          <Field>
            <FieldLabel>
              Summary
            </FieldLabel>

            <textarea
              value={
                form.summary
              }
              onChange={(
                event
              ) =>
                updateField(
                  "summary",
                  event.target.value
                )
              }
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Short article summary"
            />
          </Field>

          <Field>
            <FieldLabel>
              Tags
            </FieldLabel>

            <input
              type="text"
              value={
                form.tags
              }
              onChange={(
                event
              ) =>
                updateField(
                  "tags",
                  event.target.value
                )
              }
              className={
                inputClass
              }
              placeholder="safety, HSE, PTW"
            />

            <p className="mt-2 text-xs text-slate-500">
              Separate tags using
              commas.
            </p>
          </Field>

          {/* IMAGE */}

          <div>
            <SectionTitle
              title="Featured Image"
              description="Update the main image displayed with this article."
            />

            <div className="mt-5">
              <ImageUpload
                value={
                  form.featuredImage
                }
                onChange={(
                  url
                ) =>
                  updateField(
                    "featuredImage",
                    url
                  )
                }
              />
            </div>
          </div>

          {/* CONTENT */}

          <div>
            <SectionTitle
              title="Article Content"
              description="Edit the full technical article using the PetroHub rich-text editor."
            />

            <div className="mt-5">
              <RichTextEditor
                value={
                  form.content
                }
                onChange={(
                  html
                ) =>
                  updateField(
                    "content",
                    html
                  )
                }
              />
            </div>
          </div>

          {/* PUBLISHING */}

          <div>
            <SectionTitle
              title="Publishing"
              description="Control publication state, author information and attribution."
            />

            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <Field>
                <FieldLabel>
                  Publication Status
                </FieldLabel>

                <select
                  value={
                    form.status
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "status",
                      event.target.value as PublicationStatus
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>
                </select>
              </Field>

              <Field>
                <FieldLabel>
                  Author
                </FieldLabel>

                <input
                  type="text"
                  value={
                    form.author
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "author",
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field>
                <FieldLabel>
                  Source
                </FieldLabel>

                <input
                  type="text"
                  value={
                    form.source
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "source",
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field>
                <FieldLabel>
                  Source URL
                </FieldLabel>

                <input
                  type="url"
                  value={
                    form.sourceUrl
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "sourceUrl",
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="https://example.com"
                />
              </Field>

              <Field>
                <FieldLabel>
                  License
                </FieldLabel>

                <input
                  type="text"
                  value={
                    form.license
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "license",
                      event.target.value
                    )
                  }
                  className={
                    inputClass
                  }
                  placeholder="Original Content, CC BY 4.0..."
                />
              </Field>
            </div>

            <label className="mt-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <input
                type="checkbox"
                checked={
                  form.featured
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "featured",
                    event.target.checked
                  )
                }
                className="h-5 w-5"
              />

              <div>
                <p className="font-semibold">
                  Featured Article
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Highlight this
                  article in prominent
                  PetroHub locations.
                </p>
              </div>
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-4 border-t border-slate-800 pt-6">
            <button
              type="submit"
              disabled={
                saving
              }
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Article"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/articles"
                )
              }
              disabled={
                saving
              }
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-orange-500";

function Field({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-300">
      {children}
    </label>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}