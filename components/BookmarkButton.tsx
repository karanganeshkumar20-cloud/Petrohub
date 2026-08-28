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
    data: session,
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
  ] = useState(false);

  const [
    checking,
    setChecking,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
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
      setChecking(false);
      return;
    }

    async function checkBookmark() {
      try {
        const response =
          await fetch(
            `/api/bookmarks?itemType=${itemType}&itemId=${itemId}`,
            {
              cache:
                "no-store",
            }
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {
          setSaved(
            data.saved ===
              true
          );

          setBookmarkId(
            data.bookmarkId ||
              null
          );
        }
      } catch (error) {
        console.error(
          "Bookmark check error:",
          error
        );
      } finally {
        setChecking(false);
      }
    }

    checkBookmark();
  }, [
    status,
    itemType,
    itemId,
  ]);

  async function handleBookmark() {
    setError("");

    /*
     * Login required
     */

    if (
      status !==
      "authenticated" ||
      !session?.user
    ) {
      const callbackUrl =
        window.location
          .pathname;

      window.location.href =
        `/login?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}`;

      return;
    }

    setLoading(true);

    try {
      /*
       * REMOVE
       */

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

      /*
       * SAVE
       */

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
        data.bookmarkId
      );
    } catch (error) {
      setError(
        error instanceof
          Error
          ? error.message
          : "Unable to update bookmark"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={
          handleBookmark
        }
        disabled={
          loading ||
          checking
        }
        className={`rounded-xl border px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          saved
            ? "border-orange-500 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
            : "border-slate-700 bg-slate-900 text-slate-300 hover:border-orange-500 hover:text-orange-400"
        } ${className}`}
      >
        {checking
          ? "Checking..."
          : loading
            ? "Please wait..."
            : saved
              ? "★ Saved"
              : "☆ Save"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}