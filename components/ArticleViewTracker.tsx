"use client";

import { useEffect } from "react";

export default function ArticleViewTracker({
  articleId,
}: {
  articleId: string;
}) {
  useEffect(() => {
    async function increaseView() {
      try {
        await fetch(`/api/articles/${articleId}/view`, {
          method: "POST",
        });
      } catch (error) {
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