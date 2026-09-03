import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login",

  description:
    "Login to your PetroHub account to access saved engineering resources and account features.",

  alternates: {
    canonical: "/login",
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

export default function LoginLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}