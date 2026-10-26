"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  calculateVogelIPR,
} from "@/lib/calculators/reservoirBatch1";

function formatNumber(
  value: number,
  digits = 2
) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return value.toLocaleString(
    "en-US",
    {
      maximumFractionDigits:
        digits,
    }
  );
}

export default function VogelIPRCalculator() {
  const [
    reservoirPressure,
    setReservoirPressure,
  ] = useState("3000");

  const [
    flowingBottomholePressure,
    setFlowingBottomholePressure,
  ] = useState("1000");

  const [
    maxProductionRate,
    setMaxProductionRate,
  ] = useState("1000");

  const [
    result,
    setResult,
  ] = useState<{
    productionRateStbPerDay:
      number;
    productionRateM3PerDay:
      number;
    percentOfMaxRate:
      number;
    pressureRatio:
      number;
  } | null>(null);

  const [
    error,
    setError,
  ] = useState("");

  function calculate(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const calculated =
        calculateVogelIPR({
          reservoirPressurePsi:
            Number(
              reservoirPressure
            ),

          flowingBottomholePressurePsi:
            Number(
              flowingBottomholePressure
            ),

          maxProductionRateStbPerDay:
            Number(
              maxProductionRate
            ),
        });

      setResult(
        calculated
      );
    } catch (err) {
      setResult(
        null
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate."
      );
    }
  }

  function reset() {
    setReservoirPressure(
      "3000"
    );

    setFlowingBottomholePressure(
      "1000"
    );

    setMaxProductionRate(
      "1000"
    );

    setResult(
      null
    );

    setError("");
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
      {/* HEADER */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          Reservoir Engineering
        </p>

        <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
          Vogel IPR Calculator
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          Estimate oil production
          rate using Vogel&apos;s
          inflow performance
          relationship for a
          solution-gas-drive
          reservoir.
        </p>
      </div>

      {/* FORM */}

      <form
        onSubmit={
          calculate
        }
        className="mt-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            label="Reservoir Pressure Pr"
            unit="psi"
            value={
              reservoirPressure
            }
            onChange={
              setReservoirPressure
            }
          />

          <InputField
            label="Flowing Bottomhole Pressure Pwf"
            unit="psi"
            value={
              flowingBottomholePressure
            }
            onChange={
              setFlowingBottomholePressure
            }
          />

          <InputField
            label="Maximum Production Rate qmax"
            unit="STB/day"
            value={
              maxProductionRate
            }
            onChange={
              setMaxProductionRate
            }
          />
        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* BUTTONS */}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-400"
          >
            Calculate
          </button>

          <button
            type="button"
            onClick={
              reset
            }
            className="rounded-xl border border-slate-700 bg-slate-950 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-500"
          >
            Reset
          </button>
        </div>
      </form>

      {/* RESULT */}

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
            <p className="text-sm text-orange-200">
              Production Rate
            </p>

            <p className="mt-2 text-3xl font-black text-white">
              {formatNumber(
                result.productionRateStbPerDay
              )}{" "}
              STB/day
            </p>
          </div>

          <ResultItem
            label="Production Rate"
            value={`${formatNumber(
              result.productionRateM3PerDay
            )} m3/day`}
          />

          <ResultItem
            label="Percentage of Maximum Rate"
            value={`${formatNumber(
              result.percentOfMaxRate
            )}%`}
          />

          <ResultItem
            label="Pressure Ratio Pwf / Pr"
            value={formatNumber(
              result.pressureRatio,
              4
            )}
          />
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INPUT FIELD
========================================================= */

function InputField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </span>

      <div className="flex overflow-hidden rounded-xl border border-slate-700 bg-slate-950 focus-within:border-orange-500">
        <input
          type="number"
          step="any"
          required
          value={
            value
          }
          onChange={(
            event
          ) =>
            onChange(
              event
                .target
                .value
            )
          }
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
        />

        <span className="flex items-center border-l border-slate-700 px-3 text-sm text-slate-400">
          {unit}
        </span>
      </div>
    </label>
  );
}

/* =========================================================
   RESULT ITEM
========================================================= */

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-right font-semibold text-white">
        {value}
      </span>
    </div>
  );
}