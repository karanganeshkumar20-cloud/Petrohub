"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSession,
} from "next-auth/react";

type Props = {
  itemType:
    | "article"
    | "book";

  itemId: string;

  className?: string;
};

export default function BookmarkButton({
  itemType,
  itemId,
  className = "",
}: Props) {
  const {
    status,
  } = useSession();

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    bookmarkId,
    setBookmarkId,
  ] =
    useState<
      string | null
    >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    processing,
    setProcessing,
  ] = useState(false);

  /* =========================
     CHECK BOOKMARK
  ========================= */

  useEffect(() => {
    async function checkBookmark() {
      if (
        status ===
        "loading"
      ) {
        return;
      }

      if (
        status !==
        "authenticated"
      ) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await fetch(
            `/api/bookmarks?itemType=${itemType}&itemId=${itemId}`,
            {
              method: "GET",

              cache:
                "no-store",
            }
          );

        if (
          !response.ok
        ) {
          setLoading(false);
          return;
        }

        const data =
          await response.json();

        setSaved(
          data.saved ===
            true
        );

        setBookmarkId(
          data.bookmarkId ||
            null
        );
      } catch (
        error
      ) {
        console.error(
          "Bookmark check error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    checkBookmark();
  }, [
    status,
    itemType,
    itemId,
  ]);

  /* =========================
     SAVE / REMOVE
  ========================= */

  async function handleBookmark() {
    if (
      processing
    ) {
      return;
    }

    /* LOGIN REQUIRED */

    if (
      status !==
      "authenticated"
    ) {
      const callbackUrl =
        window.location.pathname;

      window.location.href =
        `/login?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`;

      return;
    }

    setProcessing(true);

    try {
      /* =========================
         REMOVE BOOKMARK
      ========================= */

      if (
        saved &&
        bookmarkId
      ) {
        const response =
          await fetch(
            `/api/bookmarks/${bookmarkId}`,
            {
              method:
                "DELETE",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to remove bookmark"
          );
        }

        setSaved(false);

        setBookmarkId(
          null
        );

        return;
      }

      /* =========================
         SAVE BOOKMARK
      ========================= */

      const response =
        await fetch(
          "/api/bookmarks",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  itemType,
                  itemId,
                }
              ),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save bookmark"
        );
      }

      setSaved(true);

      setBookmarkId(
        data.bookmarkId ||
          null
      );
    } catch (
      error
    ) {
      console.error(
        "Bookmark error:",
        error
      );

      alert(
        error instanceof
          Error
          ? error.message
          : "Unable to update saved item"
      );
    } finally {
      setProcessing(false);
    }
  }

  /* =========================
     BUTTON
  ========================= */

  return (
    <button
      type="button"
      onClick={
        handleBookmark
      }
      disabled={
        loading ||
        processing
      }
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        border
        px-5
        py-3
        font-bold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-60

        ${
          saved
            ? `
              border-yellow-500/50
              bg-yellow-500/10
              text-yellow-400
              hover:bg-yellow-500/20
            `
            : `
              border-slate-700
              bg-slate-900
              text-slate-300
              hover:border-orange-500
              hover:text-orange-400
            `
        }

        ${className}
      `}
    >
      {/* STAR ICON */}

      <span
        className="text-xl leading-none"
        aria-hidden="true"
      >
        {saved
          ? "★"
          : "☆"}
      </span>

      {/* TEXT */}

      <span>
        {loading
          ? "Checking..."
          : processing
          ? "Please wait..."
          : saved
          ? "Saved"
          : "Save"}
      </span>
    </button>
  );
}