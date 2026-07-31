"use client";

import { useState } from "react";

export default function NewArticlePage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

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

    setLoading(false);

    if (data.success) {
      alert("Article created successfully!");

      setForm({
        title: "",
        summary: "",
        content: "",
        category: "",
      });
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        New Article
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <input
          className="w-full border rounded p-3"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <input
          className="w-full border rounded p-3"
          placeholder="Category"
          value={form.category}
          onChange={(e) =>
            setForm({
              ...form,
              category: e.target.value,
            })
          }
        />

        <textarea
          className="w-full border rounded p-3"
          rows={3}
          placeholder="Summary"
          value={form.summary}
          onChange={(e) =>
            setForm({
              ...form,
              summary: e.target.value,
            })
          }
        />

        <textarea
          className="w-full border rounded p-3"
          rows={10}
          placeholder="Content"
          value={form.content}
          onChange={(e) =>
            setForm({
              ...form,
              content: e.target.value,
            })
          }
        />

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Publish Article"}
        </button>
      </form>
    </div>
  );
}