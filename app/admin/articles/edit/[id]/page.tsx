"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ArticleForm = {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string;
  status: string;
  featuredImage: string;
  source: string;
  sourceUrl: string;
  license: string;
  author: string;
  featured: boolean;
};

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const articleId = params.id as string;

  const [form, setForm] = useState<ArticleForm>({
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
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/articles/${articleId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Article not found");
        }

        const article = data.article;

        setForm({
          title: article.title || "",
          summary: article.summary || "",
          content: article.content || "",
          category: article.category || "",
          tags: Array.isArray(article.tags)
            ? article.tags.join(", ")
            : "",
          status: article.status || "Draft",
          featuredImage: article.featuredImage || "",
          source: article.source || "PetroHub",
          sourceUrl: article.sourceUrl || "",
          license: article.license || "",
          author: article.author || "PetroHub Team",
          featured: Boolean(article.featured),
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

    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  function updateField(
    field: keyof ArticleForm,
    value: string | boolean
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    if (!form.category.trim()) {
      alert("Category is required");
      return;
    }

    if (!form.content.trim()) {
      alert("Content is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update article"
        );
      }

      alert("Article updated successfully!");

      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
          Loading article...
        </div>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">
            Unable to load article
          </h1>

          <p className="mt-3 text-gray-700">{error}</p>

          <button
            type="button"
            onClick={() => router.push("/admin/articles")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Article
          </h1>

          <p className="mt-2 text-gray-600">
            Update the article information and content.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl bg-white p-6 shadow-sm sm:p-8"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              placeholder="Article title"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                updateField("category", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              required
            >
              <option value="">Select category</option>
              <option value="HSE">HSE</option>
              <option value="Oil & Gas">Oil & Gas</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
              <option value="Instrumentation">
                Instrumentation
              </option>
              <option value="Process">Process</option>
              <option value="Geology">Geology</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Summary
            </label>

            <textarea
              value={form.summary}
              onChange={(event) =>
                updateField("summary", event.target.value)
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              placeholder="Short article summary"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Content
            </label>

            <textarea
              value={form.content}
              onChange={(event) =>
                updateField("content", event.target.value)
              }
              rows={18}
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              placeholder="Full article content"
              required
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Tags
            </label>

            <input
              type="text"
              value={form.tags}
              onChange={(event) =>
                updateField("tags", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              placeholder="permit, safety, HSE, PTW"
            />

            <p className="mt-2 text-sm text-gray-500">
              Separate tags using commas.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Author
              </label>

              <input
                type="text"
                value={form.author}
                onChange={(event) =>
                  updateField("author", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              Featured Image URL
            </label>

            <input
              type="url"
              value={form.featuredImage}
              onChange={(event) =>
                updateField(
                  "featuredImage",
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Source
              </label>

              <input
                type="text"
                value={form.source}
                onChange={(event) =>
                  updateField("source", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Source URL
              </label>

              <input
                type="url"
                value={form.sourceUrl}
                onChange={(event) =>
                  updateField("sourceUrl", event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-gray-800">
              License
            </label>

            <input
              type="text"
              value={form.license}
              onChange={(event) =>
                updateField("license", event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              placeholder="Original Content, CC BY 4.0, Public Domain"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                updateField("featured", event.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="font-semibold text-gray-800">
              Mark as featured article
            </span>
          </label>

          <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Article"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/articles")}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}