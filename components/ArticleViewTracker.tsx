"use client";

import { useEffect } from "react";

export default function ArticleViewTracker({
  articleId,
}: {
  articleId: string;
}) {
  useEffect(() => {
    if (!articleId) {
      return;
    }

    const storageKey =
      `petrohub-article-view-${articleId}`;

    /*
     * Same browser tab/session-la
     * same article repeated mount
     * aana duplicate view count
     * prevent pannum.
     */
    const alreadyTracked =
      sessionStorage.getItem(
        storageKey
      );

    if (alreadyTracked) {
      return;
    }

    /*
     * Request start aagurathukku
     * munnadi mark pannuvom.
     * React Strict Mode duplicate
     * effect-ai idhu stop pannum.
     */
    sessionStorage.setItem(
      storageKey,
      "1"
    );

    async function increaseView() {
      try {
        const response =
          await fetch(
            `/api/articles/${articleId}/view`,
            {
              method: "POST",
              cache: "no-store",
            }
          );

        /*
         * Server request fail aana
         * next attempt-ku allow pannuvom.
         */
        if (!response.ok) {
          sessionStorage.removeItem(
            storageKey
          );

          console.error(
            "Unable to update article views:",
            response.status
          );
        }
      } catch (error) {
        sessionStorage.removeItem(
          storageKey
        );

        console.error(
          "Unable to update article views:",
          error
        );
      }
    }

    increaseView();
  }, [articleId]);

  return null;
}