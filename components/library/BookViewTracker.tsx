"use client";

import { useEffect } from "react";

export default function BookViewTracker({
  bookId,
}: {
  bookId: string;
}) {
  useEffect(() => {
    async function increaseView() {
      try {
        await fetch(
          `/api/books/${bookId}/view`,
          {
            method: "POST",
          }
        );
      } catch (error) {
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