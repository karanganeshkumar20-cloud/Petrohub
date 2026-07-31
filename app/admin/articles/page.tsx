"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Article = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  views: number;
  createdAt: string;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchArticles() {
    try {
      const response = await fetch("/api/articles", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setArticles((currentArticles) =>
          currentArticles.filter((article) => article._id !== id)
        );

        alert("Article deleted successfully");
      } else {
        alert(data.message || "Unable to delete article");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Articles
            </h1>

            <p className="mt-2 text-gray-600">
              Create, edit, view, and delete PetroHub articles.
            </p>
          </div>

          <Link
            href="/admin/articles/new"
            className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            + New Article
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 shadow-sm">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">No articles found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Title
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Views
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Created
                  </th>

                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article._id}
                    className="border-t border-gray-200"
                  >
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {article.title}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {article.category}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          article.status === "Published"
                            ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                            : "rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700"
                        }
                      >
                        {article.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {article.views}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/articles/${article.slug}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/articles/edit/${article._id}`}
                          className="font-medium text-amber-600 hover:underline"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => deleteArticle(article._id)}
                          className="font-medium text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}