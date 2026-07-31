import Link from "next/link";

type Article = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  createdAt: string;
};

export default function ArticleCard({
  article,
}: {
  article: Article;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/50">
      <span className="w-fit rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
        {article.category}
      </span>

      <h3 className="mt-5 text-2xl font-bold leading-8">
        {article.title}
      </h3>

      <p className="mt-4 flex-1 leading-7 text-slate-400">
        {article.summary}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-500">
          {new Date(article.createdAt).toLocaleDateString()}
        </span>

        <Link
          href={`/articles/${article.slug}`}
          className="font-semibold text-orange-400 hover:text-orange-300"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}