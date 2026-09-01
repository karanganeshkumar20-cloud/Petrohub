"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

export type AnalyticsRangeDays =
  | 7
  | 30
  | 90;

const STORAGE_KEY =
  "petrohub-analytics-range";

const EVENT_NAME =
  "petrohub-analytics-range-change";

/* =========================================================
   VALIDATE
========================================================= */

function parseRange(
  value:
    | string
    | number
    | null
    | undefined
):
  | AnalyticsRangeDays
  | null {
  const parsed =
    Number(value);

  if (
    parsed === 7 ||
    parsed === 30 ||
    parsed === 90
  ) {
    return parsed;
  }

  return null;
}

/* =========================================================
   READ SAVED RANGE
========================================================= */

function readSavedRange(
  fallback:
    AnalyticsRangeDays
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return fallback;
  }

  /* =====================================================
     FIRST PRIORITY:
     URL
  ===================================================== */

  const params =
    new URLSearchParams(
      window.location.search
    );

  const urlRange =
    parseRange(
      params.get(
        "days"
      )
    );

  if (urlRange) {
    return urlRange;
  }

  /* =====================================================
     SECOND PRIORITY:
     LOCAL STORAGE
  ===================================================== */

  try {
    const storedRange =
      parseRange(
        window.localStorage.getItem(
          STORAGE_KEY
        )
      );

    if (
      storedRange
    ) {
      return storedRange;
    }
  } catch {
    /*
      Browser storage may
      occasionally be unavailable.

      Fallback safely.
    */
  }

  return fallback;
}

/* =========================================================
   UPDATE URL
========================================================= */

function updateUrl(
  days:
    AnalyticsRangeDays
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const url =
    new URL(
      window.location.href
    );

  url.searchParams.set(
    "days",
    String(days)
  );

  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useAnalyticsRange(
  fallback:
    AnalyticsRangeDays = 30
) {
  /*
    Start with fallback so SSR
    and client hydration match.
  */

  const [
    days,
    setDaysState,
  ] =
    useState<AnalyticsRangeDays>(
      fallback
    );

  /* =====================================================
     INITIAL LOAD + GLOBAL EVENT
  ===================================================== */

  useEffect(() => {
    const initial =
      readSavedRange(
        fallback
      );

    setDaysState(
      initial
    );

    updateUrl(
      initial
    );

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        String(initial)
      );
    } catch {
      // Safe fallback.
    }

    /* =================================================
       LISTEN FOR RANGE CHANGES
    ================================================= */

    function handleRangeChange(
      event: Event
    ) {
      const customEvent =
        event as CustomEvent<{
          days?: number;
        }>;

      const nextRange =
        parseRange(
          customEvent.detail
            ?.days
        );

      if (
        !nextRange
      ) {
        return;
      }

      setDaysState(
        nextRange
      );
    }

    window.addEventListener(
      EVENT_NAME,
      handleRangeChange
    );

    return () => {
      window.removeEventListener(
        EVENT_NAME,
        handleRangeChange
      );
    };
  }, [
    fallback,
  ]);

  /* =====================================================
     GLOBAL SETTER
  ===================================================== */

  const setDays =
    useCallback(
      (
        nextDays:
          AnalyticsRangeDays
      ) => {
        setDaysState(
          nextDays
        );

        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            String(nextDays)
          );
        } catch {
          // Safe fallback.
        }

        updateUrl(
          nextDays
        );

        window.dispatchEvent(
          new CustomEvent(
            EVENT_NAME,
            {
              detail: {
                days:
                  nextDays,
              },
            }
          )
        );
      },
      []
    );

  return [
    days,
    setDays,
  ] as const;
}