"use client";

import ReactMarkdown, {
  type Components,
} from "react-markdown";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import {
  normalizeTechnicalMarkdown,
} from "@/lib/technicalMarkdown";

type TechnicalMarkdownProps = {
  content: string;
};

const markdownComponents: Components = {
  h1({ children }) {
    return (
      <h1 className="mb-5 mt-10 text-3xl font-extrabold leading-tight text-white first:mt-0 sm:text-4xl">
        {children}
      </h1>
    );
  },

  h2({ children }) {
    return (
      <h2 className="mb-4 mt-9 border-b border-slate-800 pb-3 text-2xl font-bold leading-tight text-white first:mt-0 sm:text-3xl">
        {children}
      </h2>
    );
  },

  h3({ children }) {
    return (
      <h3 className="mb-3 mt-7 text-xl font-bold leading-tight text-white sm:text-2xl">
        {children}
      </h3>
    );
  },

  h4({ children }) {
    return (
      <h4 className="mb-3 mt-6 text-lg font-bold text-slate-100">
        {children}
      </h4>
    );
  },

  p({ children }) {
    return (
      <p className="my-4 break-words text-base leading-8 text-slate-300 sm:text-lg">
        {children}
      </p>
    );
  },

  strong({ children }) {
    return (
      <strong className="font-bold text-white">
        {children}
      </strong>
    );
  },

  em({ children }) {
    return (
      <em className="italic text-slate-200">
        {children}
      </em>
    );
  },

  ul({ children }) {
    return (
      <ul className="my-5 list-disc space-y-2.5 pl-6 text-slate-300 marker:text-orange-400">
        {children}
      </ul>
    );
  },

  ol({ children }) {
    return (
      <ol className="my-5 list-decimal space-y-2.5 pl-6 text-slate-300 marker:font-bold marker:text-orange-400">
        {children}
      </ol>
    );
  },

  li({ children }) {
    return (
      <li className="pl-1 leading-8">
        {children}
      </li>
    );
  },

  blockquote({ children }) {
    return (
      <blockquote className="my-6 rounded-r-xl border-l-4 border-orange-500 bg-orange-500/5 px-5 py-3 text-slate-300">
        {children}
      </blockquote>
    );
  },

  hr() {
    return (
      <hr className="my-9 border-slate-800" />
    );
  },

  table({ children }) {
    return (
      <div className="my-7 w-full overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    );
  },

  thead({ children }) {
    return (
      <thead className="bg-slate-800 text-slate-100">
        {children}
      </thead>
    );
  },

  tbody({ children }) {
    return (
      <tbody className="divide-y divide-slate-800">
        {children}
      </tbody>
    );
  },

  tr({ children }) {
    return (
      <tr className="transition hover:bg-slate-800/30">
        {children}
      </tr>
    );
  },

  th({ children }) {
    return (
      <th className="border-r border-slate-700 px-4 py-3 font-bold text-white last:border-r-0">
        {children}
      </th>
    );
  },

  td({ children }) {
    return (
      <td className="border-r border-slate-800 px-4 py-3 align-top leading-6 text-slate-300 last:border-r-0">
        {children}
      </td>
    );
  },

  pre({ children }) {
    return (
      <pre className="my-6 max-w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-5">
        {children}
      </pre>
    );
  },

  code({
    children,
    className,
  }) {
    const isBlock =
      Boolean(
        className?.includes(
          "language-"
        )
      );

    if (isBlock) {
      return (
        <code className="font-mono text-sm leading-7 text-slate-200">
          {children}
        </code>
      );
    }

    return (
      <code className="rounded-md border border-slate-700 bg-slate-950 px-1.5 py-0.5 font-mono text-[0.9em] text-orange-300">
        {children}
      </code>
    );
  },

  a({
    href,
    children,
  }) {
    if (
      !href ||
      !href.startsWith("/")
    ) {
      return (
        <span className="font-medium text-slate-200">
          {children}
        </span>
      );
    }

    return (
      <a
        href={href}
        className="font-semibold text-orange-400 underline decoration-orange-500/40 underline-offset-4 transition hover:text-orange-300"
      >
        {children}
      </a>
    );
  },
};

export default function TechnicalMarkdown({
  content,
}: TechnicalMarkdownProps) {
  const normalizedContent =
    normalizeTechnicalMarkdown(
      content
    );

  return (
    <div
      className="
        petrohub-technical-content
        min-w-0
        max-w-full
        overflow-hidden

        [&_.katex]:text-slate-100

        [&_.katex-display]:my-6
        [&_.katex-display]:max-w-full
        [&_.katex-display]:overflow-x-auto
        [&_.katex-display]:overflow-y-hidden
      "
    >
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
        ]}
        rehypePlugins={[
          rehypeKatex,
        ]}
        components={
          markdownComponents
        }
        skipHtml
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}