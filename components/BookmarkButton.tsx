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
    | "book"
    | "formula";

  itemId:
    string;

  className?:
    string;
};

type BookmarkResponse = {
  success?: boolean;

  saved?: boolean;

  bookmarkId?:
    string | null;

  message?:
    string;
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
  ] = useState(
    false
  );

  const [
    bookmarkId,
    setBookmarkId,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  const [
    processing,
    setProcessing,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState(
    ""
  );

  /* =====================================================
     CHECK BOOKMARK
  ===================================================== */

  useEffect(() => {
    let active =
      true;

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
        if (
          active
        ) {
          setLoading(
            false
          );
        }

        return;
      }

      setLoading(
        true
      );

      try {
        const response =
          await fetch(
            `/api/bookmarks?itemType=${encodeURIComponent(
              itemType
            )}&itemId=${encodeURIComponent(
              itemId
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as
          BookmarkResponse;

        if (
          !active
        ) {
          return;
        }

        if (
          !response.ok ||
          !data.success
        ) {
          setSaved(
            false
          );

          setBookmarkId(
            null
          );

          return;
        }

        setSaved(
          data.saved ===
            true
        );

        setBookmarkId(
          data.bookmarkId ||
            null
        );
      } catch (error) {
        console.error(
          "Bookmark check error:",
          error
        );
      } finally {
        if (
          active
        ) {
          setLoading(
            false
          );
        }
      }
    }

    checkBookmark();

    return () => {
      active =
        false;
    };
  }, [
    status,
    itemType,
    itemId,
  ]);

  /* =====================================================
     SAVE / REMOVE
  ===================================================== */

  async function handleBookmark() {
    if (
      processing ||
      loading
    ) {
      return;
    }

    if (
      status !==
      "authenticated"
    ) {
      const callbackUrl =
        `${window.location.pathname}${window.location.search}`;

      window.location.href =
        `/login?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`;

      return;
    }

    setProcessing(
      true
    );

    setError(
      ""
    );

    try {
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
          (await response.json()) as
          BookmarkResponse;

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to remove bookmark"
          );
        }

        setSaved(
          false
        );

        setBookmarkId(
          null
        );

        return;
      }

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
              JSON.stringify({
                itemType,
                itemId,
              }),
          }
        );

      const data =
        (await response.json()) as
        BookmarkResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to save bookmark"
        );
      }

      setSaved(
        true
      );

      setBookmarkId(
        data.bookmarkId ||
          null
      );
    } catch (error) {
      console.error(
        "Bookmark error:",
        error
      );

      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to update saved item"
      );
    } finally {
      setProcessing(
        false
      );
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={
          handleBookmark
        }
        aria-pressed={
          saved
        }
        disabled={
          loading ||
          processing
        }
        className={
          saved
            ? "inline-flex items-center justify-center rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-5 py-3 font-bold text-yellow-400 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold text-slate-300 transition hover:border-orange-500 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading
          ? "Checking..."
          : processing
            ? "Please wait..."
            : saved
              ? "Saved"
              : "Save"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-2 text-sm text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
