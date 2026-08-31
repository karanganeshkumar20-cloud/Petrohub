"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

type Props = {
  itemType: "article" | "book";
  itemId: string;
};

export default function ReadingHistoryTracker({
  itemType,
  itemId,
}: Props) {
  const { status } = useSession();

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !itemId
    ) {
      return;
    }

    const storageKey =
      `petrohub-history-${itemType}-${itemId}`;

    /*
     * Prevent React Strict Mode,
     * rerenders and component remounts
     * from counting the same visit
     * multiple times in one tab session.
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
      "tracked"
    );

    async function track() {
      try {
        const response =
          await fetch(
            "/api/history",
            {
              method: "POST",

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

        if (!response.ok) {
          /*
           * Allow retry if
           * request actually failed.
           */
          sessionStorage.removeItem(
            storageKey
          );

          console.error(
            "History tracking failed:",
            response.status
          );
        }
      } catch (error) {
        sessionStorage.removeItem(
          storageKey
        );

        console.error(
          "History tracking error:",
          error
        );
      }
    }

    track();
  }, [
    status,
    itemType,
    itemId,
  ]);

  return null;
}