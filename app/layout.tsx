import type {
  Metadata,
  Viewport,
} from "next";

import type {
  ReactNode,
} from "react";

import "./globals.css";

import AuthProvider from "@/components/SessionProvider";

/* =========================================================
   SITE URL
========================================================= */

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "http://localhost:3000";

const metadataBase =
  new URL(siteUrl);

/* =========================================================
   GLOBAL SEO METADATA
========================================================= */

export const metadata: Metadata = {
  metadataBase,

  applicationName:
    "PetroHub",

  title: {
    default:
      "PetroHub | Oil & Gas, HSE & Engineering Knowledge Platform",

    template:
      "%s | PetroHub",
  },

  description:
    "PetroHub is a professional engineering knowledge platform for Oil & Gas, HSE, Mechanical, Civil, Electrical, Instrumentation, Process and Geology professionals and students.",

  keywords: [
    "PetroHub",
    "Oil and Gas",
    "Oil and Gas Engineering",
    "Petroleum Engineering",
    "HSE",
    "Health and Safety",
    "Safety Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Instrumentation Engineering",
    "Process Engineering",
    "Geology",
    "Engineering Articles",
    "Engineering Resources",
    "Engineering Books",
    "HSE Articles",
    "Oil and Gas Articles",
  ],

  authors: [
    {
      name:
        "PetroHub",
    },
  ],

  creator:
    "PetroHub",

  publisher:
    "PetroHub",

  category:
    "Engineering Education",

  referrer:
    "origin-when-cross-origin",

  formatDetection: {
    email:
      false,

    address:
      false,

    telephone:
      false,
  },

  /* =====================================================
     CANONICAL
  ===================================================== */

  alternates: {
    canonical:
      "/",
  },

  /* =====================================================
     OPEN GRAPH
  ===================================================== */

  openGraph: {
    type:
      "website",

    locale:
      "en_US",

    url:
      "/",

    siteName:
      "PetroHub",

    title:
      "PetroHub | Oil & Gas, HSE & Engineering Knowledge Platform",

    description:
      "Professional engineering knowledge, technical articles and resources for Oil & Gas, HSE and multidisciplinary engineering professionals and students.",
  },

  /* =====================================================
     TWITTER / SOCIAL
  ===================================================== */

  twitter: {
    card:
      "summary_large_image",

    title:
      "PetroHub | Oil & Gas, HSE & Engineering Knowledge Platform",

    description:
      "Engineering knowledge, technical articles and professional resources for Oil & Gas, HSE and engineering professionals.",
  },

  /* =====================================================
     SEARCH ENGINE RULES
  ===================================================== */

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      noimageindex:
        false,

      "max-video-preview":
        -1,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,
    },
  },

  /* =====================================================
     GOOGLE SEARCH CONSOLE
     
     Later GOOGLE_SITE_VERIFICATION
     env variable add pannina automatic-aa
     verification metadata varum.
  ===================================================== */

  verification: {
  google: "CqgxeyIjpYsLkkvuvCO4SjtPzvgfFP0HeAROGK4NJIQ",
},
};

/* =========================================================
   VIEWPORT
========================================================= */

export const viewport: Viewport = {
  width:
    "device-width",

  initialScale:
    1,

  themeColor:
    "#020617",
};

/* =========================================================
   ROOT LAYOUT
========================================================= */

export default function RootLayout({
  children,
}: Readonly<{
  children:
    ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className="bg-slate-950 text-slate-100 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}