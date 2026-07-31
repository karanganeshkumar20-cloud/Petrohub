import { notFound } from "next/navigation";

async function getArticle(slug: string) {
  const res = await fetch(
    `http://localhost:3000/api/articles`,
    {
      cache: "no-store",
    }
  );

  const data = await res.json();

  return data.articles.find(
    (a: any) => a.slug === slug
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-5xl font-bold">
        {article.title}
      </h1>

      <div className="mt-3 text-gray-500">
        {article.category}
      </div>

      <p className="mt-8 text-lg">
        {article.summary}
      </p>

      <article className="prose prose-lg max-w-none mt-10 whitespace-pre-wrap">
        {article.content}
      </article>
    </main>
  );
}