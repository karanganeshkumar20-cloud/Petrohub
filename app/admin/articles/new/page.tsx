"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

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
  featuredImage: string;
  source: string;
  sourceUrl: string;
  license: string;
  author: string;
  featured: boolean;
};

const emptyForm: ArticleForm = {
  title: "",
  summary: "",
  content: "",
  category: "",
  tags: "",
  featuredImage: "",
  source: "PetroHub",
  sourceUrl: "",
  license: "",
  author: "PetroHub Team",
  featured: false,
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

export default function NewArticlePage() {
  const router =
    useRouter();

  const [
    form,
    setForm,
  ] =
    useState<ArticleForm>(
      emptyForm
    );

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
    saveMode,
    setSaveMode,
  ] =
    useState<PublicationStatus | null>(
      null
    );

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
      !form.category
    ) {
      return "Please select a category.";
    }

    if (
      !form.content.trim()
    ) {
      return "Article content is required.";
    }

    return "";
  }

  async function saveArticle(
    status:
      PublicationStatus
  ) {
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
    setSaveMode(
      status
    );
    setError("");

    try {
      const response =
        await fetch(
          "/api/articles",
          {
            method:
              "POST",

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

                status,
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
            "Unable to create article"
        );
      }

      router.push(
        "/admin/articles"
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create article"
      );
    } finally {
      setSaving(false);
      setSaveMode(null);
    }
  }

  function clearForm() {
    setForm(
      emptyForm
    );

    setError("");
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
              Create New Article
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Create professional
              engineering content and
              save it as a draft or
              publish it immediately.
            </p>
          </div>

          <Link
            href="/admin/articles"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-orange-500 hover:text-white"
          >
            Back to Articles
          </Link>
        </div>

        <form
          onSubmit={(
            event
          ) =>
            event.preventDefault()
          }
          className="mt-10 space-y-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8"
        >
          {/* BASIC INFORMATION */}

          <SectionTitle
            title="Article Information"
            description="Core information used across PetroHub article pages."
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
                placeholder="Example: Permit to Work System"
                className={inputClass}
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
                className={inputClass}
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
              placeholder="Write a short article summary..."
              className={`${inputClass} resize-none`}
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
              placeholder="safety, PTW, HSE, permit"
              className={inputClass}
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
              description="Upload the main visual used for the article."
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
              description="Write and format the complete technical article."
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

          {/* AUTHOR */}

          <div>
            <SectionTitle
              title="Publishing Information"
              description="Author, source and licensing information."
            />

            <div className="mt-5 grid gap-6 md:grid-cols-2">
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
                  placeholder="https://example.com"
                  className={
                    inputClass
                  }
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
                  placeholder="Original Content, CC BY 4.0..."
                  className={
                    inputClass
                  }
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
                <p className="font-semibold text-white">
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

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-4 border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={() =>
                saveArticle(
                  "Published"
                )
              }
              disabled={
                saving
              }
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving &&
              saveMode ===
                "Published"
                ? "Publishing..."
                : "Publish Article"}
            </button>

            <button
              type="button"
              onClick={() =>
                saveArticle(
                  "Draft"
                )
              }
              disabled={
                saving
              }
              className="rounded-xl border border-slate-700 bg-slate-950 px-6 py-3 font-bold text-slate-300 transition hover:border-orange-500 hover:text-white disabled:opacity-50"
            >
              {saving &&
              saveMode ===
                "Draft"
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={
                clearForm
              }
              disabled={
                saving
              }
              className="rounded-xl border border-slate-800 px-6 py-3 font-semibold text-slate-400 transition hover:bg-slate-800 disabled:opacity-50"
            >
              Clear
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