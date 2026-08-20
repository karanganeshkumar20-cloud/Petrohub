"use client";

import { useState } from "react";

import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";

export default function NewArticlePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    featuredImage: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) {
      setMessage("Title is required");
      return;
    }

    if (!form.category) {
      setMessage("Please select a category");
      return;
    }

    if (!form.content.trim()) {
      setMessage("Article content is required");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          status: "Published",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create article"
        );
      }

      setMessage("Article created successfully ✅");

      setForm({
        title: "",
        summary: "",
        content: "",
        category: "",
        featuredImage: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setForm({
      title: "",
      summary: "",
      content: "",
      category: "",
      featuredImage: "",
    });

    setMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="font-semibold uppercase tracking-widest text-orange-500">
            PetroHub CMS
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Create New Article
          </h1>

          <p className="mt-3 text-slate-400">
            Create and publish professional engineering content.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Article Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Example: Permit to Work System"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Category
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="">Select category</option>
              <option value="HSE">HSE</option>
              <option value="Oil & Gas">Oil & Gas</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Electrical">Electrical</option>
              <option value="Instrumentation">Instrumentation</option>
              <option value="Process">Process</option>
              <option value="Geology">Geology</option>
            </select>
          </div>

          <ImageUpload
            value={form.featuredImage}
            onChange={(url) =>
              setForm({
                ...form,
                featuredImage: url,
              })
            }
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Summary
            </label>

            <textarea
              value={form.summary}
              onChange={(e) =>
                setForm({
                  ...form,
                  summary: e.target.value,
                })
              }
              rows={4}
              placeholder="Write a short summary about the article..."
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Article Content
            </label>

            <RichTextEditor
              value={form.content}
              onChange={(html) =>
                setForm({
                  ...form,
                  content: html,
                })
              }
            />
          </div>

          {message && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-orange-400">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-4 border-t border-slate-800 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Publishing..." : "Publish Article"}
            </button>

            <button
              type="button"
              onClick={clearForm}
              disabled={loading}
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-60"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}