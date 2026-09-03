import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Search PetroHub",

  description:
    "Search PetroHub engineering articles, technical resources, manuals and professional references.",

  alternates: {
    canonical: "/search",
  },

  robots: {
    index: false,
    follow: true,

    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function SearchLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}