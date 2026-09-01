"use client";

import {
  useEffect,
} from "react";

type ArticleViewTrackerProps =
  {
    articleId: string;
  };

export default function ArticleViewTracker({
  articleId,
}: ArticleViewTrackerProps) {
  useEffect(() => {
    if (!articleId) {
      return;
    }

    const storageKey =
      `petrohub-article-view-${articleId}`;

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
            `/api/articles/${articleId}/view`,
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
            "Unable to update article view"
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
                      "article",

                    itemId:
                      articleId,
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
            "Article analytics error:",
            analyticsError
          );
        }
      } catch (error) {
        /*
          Allow retry if the
          actual public view
          counter failed.
        */

        sessionStorage.removeItem(
          storageKey
        );

        console.error(
          "Article view error:",
          error
        );
      }
    }

    trackView();
  }, [articleId]);

  return null;
}