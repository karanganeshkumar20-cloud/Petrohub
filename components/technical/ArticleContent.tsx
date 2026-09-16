import TechnicalMarkdown from "@/components/technical/TechnicalMarkdown";

import {
  looksLikeHtml,
  looksLikeMarkdown,
} from "@/lib/technicalMarkdown";

type ArticleContentProps = {
  content: string;
};

export default function ArticleContent({
  content,
}: ArticleContentProps) {
  if (!content) {
    return null;
  }

  /*
    IMPORTANT:

    AI technical content containing
    Markdown / LaTeX must ALWAYS get
    priority over HTML detection.

    This fixes raw:

    ## Heading
    **Bold**
    $$ formula $$

    appearing on article pages.
  */

  if (looksLikeMarkdown(content)) {
    return (
      <TechnicalMarkdown
        content={content}
      />
    );
  }

  /*
    Legacy PetroHub articles
    stored as HTML continue to work.
  */

  if (looksLikeHtml(content)) {
    return (
      <div
        className="
          prose
          prose-invert
          max-w-none

          prose-headings:font-bold
          prose-headings:text-white

          prose-h1:mt-10
          prose-h1:text-4xl

          prose-h2:mt-10
          prose-h2:text-3xl

          prose-h3:mt-8
          prose-h3:text-2xl

          prose-p:leading-8
          prose-p:text-slate-300

          prose-strong:text-white

          prose-a:text-orange-400
          prose-a:no-underline

          hover:prose-a:text-orange-300

          prose-ul:my-6
          prose-ol:my-6

          prose-li:leading-7
          prose-li:text-slate-300

          prose-blockquote:border-orange-500
          prose-blockquote:text-slate-400

          prose-code:text-orange-300

          prose-pre:border
          prose-pre:border-slate-800
          prose-pre:bg-slate-950

          prose-hr:border-slate-800
        "
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    );
  }

  /*
    Plain text fallback.

    We still send it through Markdown
    because Markdown safely handles
    normal text too.
  */

  return (
    <TechnicalMarkdown
      content={content}
    />
  );
}