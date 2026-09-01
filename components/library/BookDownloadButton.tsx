"use client";

import {
  useState,
} from "react";

type BookDownloadButtonProps =
  {
    bookId: string;
  };

type DownloadResponse = {
  success?: boolean;

  message?: string;

  fileUrl?: string;

  title?: string;

  tracked?: boolean;

  duplicate?: boolean;
};

export default function BookDownloadButton({
  bookId,
}: BookDownloadButtonProps) {
  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =====================================================
     DOWNLOAD
  ===================================================== */

  async function handleDownload() {
    if (
      !bookId ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const response =
        await fetch(
          `/api/books/${bookId}/download`,
          {
            method:
              "GET",

            cache:
              "no-store",
          }
        );

      const result =
        (await response.json()) as
          DownloadResponse;

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to download resource"
        );
      }

      if (
        !result.fileUrl
      ) {
        throw new Error(
          "Download URL is unavailable"
        );
      }

      /* =====================
         START DOWNLOAD
      ===================== */

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href =
        result.fileUrl;

      /*
        Browsers may ignore
        download= for some
        cross-origin URLs.

        In that situation the PDF
        will open in a new tab,
        from where it can still be
        downloaded normally.
      */

      anchor.target =
        "_blank";

      anchor.rel =
        "noopener noreferrer";

      anchor.download =
        result.title
          ? `${safeFileName(
              result.title
            )}.pdf`
          : "petrohub-resource.pdf";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();
    } catch (err) {
      console.error(
        "Download error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to download resource"
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div>
      <button
        type="button"
        onClick={
          handleDownload
        }
        disabled={
          loading
        }
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          aria-hidden="true"
        >
          ↓
        </span>

        {loading
          ? "Preparing..."
          : "Download PDF"}
      </button>

      {error && (
        <p className="mt-2 max-w-sm text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FILE NAME HELPER
========================================================= */

function safeFileName(
  value: string
) {
  const cleaned =
    value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  return (
    cleaned ||
    "petrohub-resource"
  );
}