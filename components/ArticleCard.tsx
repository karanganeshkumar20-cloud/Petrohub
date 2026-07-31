import Link from "next/link";

type Article = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  createdAt: string;
};

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-lg transition">
      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
        {article.category}
      </span>

      <h2 className="mt-4 text-2xl font-bold">
        {article.title}
      </h2>

      <p className="mt-3 text-gray-600 line-clamp-3">
        {article.summary}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <small className="text-gray-500">
          {new Date(article.createdAt).toLocaleDateString()}
        </small>

        <Link
          href={`/articles/${article.slug}`}
          className="font-semibold text-blue-600 hover:underline"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}