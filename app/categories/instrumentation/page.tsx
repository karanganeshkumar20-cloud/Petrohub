import Link from "next/link";
import Navbar from "@/components/Navbar";

const instrumentationArticles = [
  {
    title: "Sensors and Transmitters Basics",
    slug: "sensors-transmitters",
    description:
      "Learn about industrial sensors, transmitters and measurement principles.",
  },

  {
    title: "Pressure Measurement",
    slug: "pressure-measurement",
    description:
      "Understand pressure instruments like pressure gauges, transmitters and switches.",
  },

  {
    title: "Temperature Measurement",
    slug: "temperature-measurement",
    description:
      "Explore RTD, thermocouple and temperature monitoring systems.",
  },

  {
    title: "Control Valves Fundamentals",
    slug: "control-valves",
    description:
      "Learn about control valve types, operation and applications.",
  },

  {
    title: "PLC and DCS Basics",
    slug: "plc-dcs",
    description:
      "Understand industrial automation, PLC systems and distributed control systems.",
  },

  {
    title: "Instrumentation Calibration",
    slug: "instrumentation-calibration",
    description:
      "Learn calibration methods and maintenance practices for instruments.",
  },
];

export default function InstrumentationPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20">

        <h1 className="text-center text-5xl font-bold">
          Instrumentation Engineering Hub
        </h1>

        <p className="mt-5 text-center text-gray-400">
          Explore measurement, control systems and industrial automation concepts.
        </p>


        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {instrumentationArticles.map((article) => (

            <div
              key={article.slug}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500"
            >

              <h2 className="text-xl font-bold">
                {article.title}
              </h2>

              <p className="mt-3 text-gray-400">
                {article.description}
              </p>


              <Link
                href={`/articles/${article.slug}`}
                className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-2 font-semibold hover:bg-orange-600"
              >
                Read Article
              </Link>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}