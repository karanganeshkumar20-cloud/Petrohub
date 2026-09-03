import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Create Account",

  description:
    "Create a PetroHub account to save engineering articles and technical resources.",

  alternates: {
    canonical: "/register",
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

export default function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}