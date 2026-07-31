import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: {
    default: "PetroHub | Oil & Gas, HSE & Engineering Knowledge Platform",
    template: "%s | PetroHub",
  },
  description:
    "PetroHub is a professional knowledge platform for Oil & Gas, HSE and Engineering professionals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}