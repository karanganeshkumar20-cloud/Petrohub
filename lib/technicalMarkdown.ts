/* =========================================================
   PETROHUB TECHNICAL MARKDOWN UTILITIES
========================================================= */

export function normalizeTechnicalMarkdown(
  rawContent: string
) {
  let content = rawContent || "";

  /* Special spaces */
  content = content.replace(/\u00a0/g, " ");

  /* \[ ... \] => $$ ... $$ */
  content = content
    .replace(/\\\[/g, "\n$$\n")
    .replace(/\\\]/g, "\n$$\n");

  /* \( ... \) => $ ... $ */
  content = content
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  /* Single $ on its own line => $$ */
  content = content.replace(
    /^[ \t]*\$[ \t]*$/gm,
    "$$"
  );

  /* Clean display equations */
  content = content.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_match, mathBody: string) => {
      let body = mathBody.trim();

      body = body.replace(
        /^\s*#{1,6}\s+/gm,
        ""
      );

      body = body
        .replace(/\\_\{/g, "_{")
        .replace(
          /\\_([A-Za-z0-9])/g,
          "_$1"
        );

      return `\n\n$$\n${body}\n$$\n\n`;
    }
  );

  content = content.replace(
    /\n{3,}/g,
    "\n\n"
  );

  return content.trim();
}

/* =========================================================
   MARKDOWN DETECTION
========================================================= */

export function looksLikeMarkdown(
  content: string
) {
  if (!content) {
    return false;
  }

  /*
    Technical AI content gets priority.

    This catches:
    ## heading
    **bold**
    $$ equations $$
    markdown lists
    markdown tables
  */

  return (
    /(^|\n)#{1,6}\s+\S/m.test(
      content
    ) ||
    /\*\*[^*]+\*\*/.test(
      content
    ) ||
    /\$\$[\s\S]+?\$\$/.test(
      content
    ) ||
    /(^|\n)[*-]\s+\S/m.test(
      content
    ) ||
    /(^|\n)\d+\.\s+\S/m.test(
      content
    ) ||
    /\|.+\|[\r\n]+\|[-:\s|]+\|/.test(
      content
    ) ||
    /\\frac\s*\{/.test(
      content
    ) ||
    /\\boxed\s*\{/.test(
      content
    )
  );
}

/* =========================================================
   HTML DETECTION
========================================================= */

export function looksLikeHtml(
  content: string
) {
  if (!content) {
    return false;
  }

  return /<\/?(?:p|h[1-6]|ul|ol|li|strong|em|blockquote|pre|code|table|thead|tbody|tr|th|td|div|span|br|hr|a)\b[^>]*>/i.test(
    content
  );
}