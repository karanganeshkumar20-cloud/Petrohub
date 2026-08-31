"use client";

import { useEffect } from "react";

export default function BookViewTracker({
  bookId,
}: {
  bookId: string;
}) {
  useEffect(() => {
    if (!bookId) {
      return;
    }

    const storageKey =
      `petrohub-book-view-${bookId}`;

    const alreadyTracked =
      sessionStorage.getItem(
        storageKey
      );

    if (alreadyTracked) {
      return;
    }

    sessionStorage.setItem(
      storageKey,
      "1"
    );

    async function increaseView() {
      try {
        const response =
          await fetch(
            `/api/books/${bookId}/view`,
            {
              method: "POST",
              cache: "no-store",
            }
          );

        if (!response.ok) {
          sessionStorage.removeItem(
            storageKey
          );

          console.error(
            "Unable to update book views:",
            response.status
          );
        }
      } catch (error) {
        sessionStorage.removeItem(
          storageKey
        );

        console.error(
          "Unable to update book views:",
          error
        );
      }
    }

    increaseView();
  }, [bookId]);

  return null;
}