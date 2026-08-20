"use client";

import { useState } from "react";

type Props = {
  bookId: string;
};

export default function BookDownloadButton({
  bookId,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/books/${bookId}/download`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to download PDF"
        );
      }

      window.open(
        data.url,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Download failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Opening PDF..." : "Download PDF"}
    </button>
  );
}