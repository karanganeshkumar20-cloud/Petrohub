"use client";

import {
  useEffect,
  useState,
} from "react";

import BookmarkButton from "@/components/BookmarkButton";

type Props = {
  slug:
    string;

  className?:
    string;
};

type ResolveResponse = {
  success?: boolean;

  formulaId?:
    string;

  message?:
    string;
};

export default function FormulaBookmarkButton({
  slug,
  className = "",
}: Props) {
  const [
    formulaId,
    setFormulaId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );

  useEffect(() => {
    let active =
      true;

    async function resolveFormula() {
      setLoading(
        true
      );

      try {
        const response =
          await fetch(
            `/api/formulas/bookmark-target?slug=${encodeURIComponent(
              slug
            )}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          );

        const data =
          (await response.json()) as
          ResolveResponse;

        if (
          !active
        ) {
          return;
        }

        if (
          !response.ok ||
          !data.success ||
          !data.formulaId
        ) {
          setFormulaId(
            ""
          );

          return;
        }

        setFormulaId(
          data.formulaId
        );
      } catch (error) {
        console.error(
          "Formula bookmark lookup error:",
          error
        );

        if (
          active
        ) {
          setFormulaId(
            ""
          );
        }
      } finally {
        if (
          active
        ) {
          setLoading(
            false
          );
        }
      }
    }

    resolveFormula();

    return () => {
      active =
        false;
    };
  }, [
    slug,
  ]);

  if (
    loading
  ) {
    return (
      <button
        type="button"
        disabled
        className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold text-slate-500 opacity-60"
      >
        Checking saved item...
      </button>
    );
  }

  /*
   * If this calculator route does
   * not correspond to a currently
   * published + verified DB formula,
   * do not show a Save button.
   */
  if (
    !formulaId
  ) {
    return null;
  }

  return (
    <BookmarkButton
      itemType="formula"
      itemId={
        formulaId
      }
      className={
        className
      }
    />
  );
}