import Link from "next/link";
import Navbar from "@/components/Navbar";
import { articles } from "@/data/articles";


export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {

  const { q } = await searchParams;

  const query = q?.toLowerCase() || "";


  const results = articles.filter((article) =>

    article.title.toLowerCase().includes(query) ||

    article.category.toLowerCase().includes(query) ||

    article.description.toLowerCase().includes(query) ||

    article.keywords.some((keyword) =>
      keyword.toLowerCase().includes(query)
    )

  );


  return (

    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />


      <section className="mx-auto max-w-7xl px-6 py-20">


        <h1 className="text-4xl font-bold">

          Search Results

        </h1>


        <p className="mt-3 text-gray-400">

          Showing results for:
          <span className="ml-2 text-orange-500">
            {q}
          </span>

        </p>



        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">


          {results.length > 0 ? (

            results.map((article) => (

              <div

                key={article.slug}

                className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                p-6
                transition
                hover:-translate-y-1
                hover:border-orange-500
                "

              >


                <span className="text-orange-500">

                  {article.category}

                </span>



                <h2 className="mt-3 text-xl font-bold">

                  {article.title}

                </h2>



                <p className="mt-3 text-gray-400">

                  {article.description}

                </p>



                <Link

                  href={`/articles/${article.slug}`}

                  className="
                  mt-5
                  inline-block
                  rounded-lg
                  bg-orange-500
                  px-5
                  py-2
                  font-semibold
                  hover:bg-orange-600
                  "

                >

                  Read Article

                </Link>



              </div>

            ))

          ) : (


            <div className="text-gray-400">

              No articles found.

            </div>


          )}


        </div>


      </section>


    </main>

  );
}