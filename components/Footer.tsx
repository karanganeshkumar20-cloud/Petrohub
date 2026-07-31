import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-10 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-2xl font-bold text-orange-500">
            PetroHub
          </Link>

          <p className="mt-2 text-sm">
            Knowledge for engineers, professionals and students.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/articles" className="hover:text-white">
            Articles
          </Link>

          <Link href="/categories" className="hover:text-white">
            Categories
          </Link>

          <Link href="/about" className="hover:text-white">
            About
          </Link>

          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </div>

        <p className="text-sm">
          © {new Date().getFullYear()} PetroHub
        </p>
      </div>
    </footer>
  );
}