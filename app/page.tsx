import ArticleCard from "@/components/ArticleCard";

async function getArticles() {
  const res = await fetch("http://localhost:3000/api/articles", {
    cache: "no-store",
  });

  const data = await res.json();

  return data.articles;
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <main>
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-6xl font-bold">
            PetroHub
          </h1>

          <p className="mt-6 text-xl max-w-3xl text-gray-300">
            The complete knowledge platform for Petroleum,
            Oil & Gas, HSE and Engineering Professionals.
          </p>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold mb-10">
          Latest Articles
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article: any) => (
            <ArticleCard
              key={article._id}
              article={article}
            />
          ))}
        </div>
      </section>
    </main>
  );
}