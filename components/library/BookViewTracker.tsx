"use client";

import {
  useEffect,
} from "react";

type BookViewTrackerProps =
  {
    bookId: string;
  };

export default function BookViewTracker({
  bookId,
}: BookViewTrackerProps) {
  useEffect(() => {
    if (!bookId) {
      return;
    }

    const storageKey =
      `petrohub-book-view-${bookId}`;

    /*
      Prevent repeated client
      increments during the same
      browser tab session.
    */

    if (
      sessionStorage.getItem(
        storageKey
      )
    ) {
      return;
    }

    sessionStorage.setItem(
      storageKey,
      "1"
    );

    async function trackView() {
      try {
        /* =====================
           PUBLIC VIEW COUNTER
        ===================== */

        const viewResponse =
          await fetch(
            `/api/books/${bookId}/view`,
            {
              method:
                "POST",

              cache:
                "no-store",
            }
          );

        if (
          !viewResponse.ok
        ) {
          throw new Error(
            "Unable to update resource view"
          );
        }

        /* =====================
           ANALYTICS EVENT
        ===================== */

        try {
          await fetch(
            "/api/analytics/track",
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
                    itemType:
                      "book",

                    itemId:
                      bookId,
                  }
                ),

              cache:
                "no-store",
            }
          );
        } catch (
          analyticsError
        ) {
          console.error(
            "Book analytics error:",
            analyticsError
          );
        }
      } catch (error) {
        sessionStorage.removeItem(
          storageKey
        );

        console.error(
          "Book view error:",
          error
        );
      }
    }

    trackView();
  }, [bookId]);

  return null;
}