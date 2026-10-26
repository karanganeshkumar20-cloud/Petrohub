"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  calculateDarcyLinearFlow,
} from "@/lib/calculators/reservoirBatch1";

function formatNumber(
  value: number,
  digits = 3
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

export default function DarcyLinearFlowCalculator() {
  const [
    permeability,
    setPermeability,
  ] = useState("100");

  const [
    area,
    setArea,
  ] = useState("10");

  const [
    pressureDrop,
    setPressureDrop,
  ] = useState("500");

  const [
    viscosity,
    setViscosity,
  ] = useState("1");

  const [
    flowLength,
    setFlowLength,
  ] = useState("100");

  const [
    result,
    setResult,
  ] = useState<{
    flowRateBblPerDay:
      number;
    flowRateM3PerDay:
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
        calculateDarcyLinearFlow({
          permeabilityMd:
            Number(
              permeability
            ),

          crossSectionalAreaFt2:
            Number(
              area
            ),

          pressureDropPsi:
            Number(
              pressureDrop
            ),

          viscosityCp:
            Number(
              viscosity
            ),

          flowLengthFt:
            Number(
              flowLength
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
    setPermeability(
      "100"
    );

    setArea(
      "10"
    );

    setPressureDrop(
      "500"
    );

    setViscosity(
      "1"
    );

    setFlowLength(
      "100"
    );

    setResult(
      null
    );

    setError("");
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 md:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          Reservoir Engineering
        </p>

        <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
          Darcy Linear Flow Calculator
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          Calculate steady-state
          single-phase linear flow
          through porous media.
        </p>
      </div>

      <form
        onSubmit={
          calculate
        }
        className="mt-8"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            label="Permeability k"
            unit="mD"
            value={
              permeability
            }
            onChange={
              setPermeability
            }
          />

          <InputField
            label="Cross-Sectional Area A"
            unit="ft²"
            value={
              area
            }
            onChange={
              setArea
            }
          />

          <InputField
            label="Pressure Drop ΔP"
            unit="psi"
            value={
              pressureDrop
            }
            onChange={
              setPressureDrop
            }
          />

          <InputField
            label="Fluid Viscosity μ"
            unit="cP"
            value={
              viscosity
            }
            onChange={
              setViscosity
            }
          />

          <InputField
            label="Flow Length L"
            unit="ft"
            value={
              flowLength
            }
            onChange={
              setFlowLength
            }
          />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

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

      {result && (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
            <p className="text-sm text-orange-200">
              Flow Rate
            </p>

            <p className="mt-2 text-3xl font-black text-white">
              {formatNumber(
                result.flowRateBblPerDay
              )}{" "}
              bbl/day
            </p>
          </div>

          <ResultItem
            label="Flow Rate"
            value={`${formatNumber(
              result.flowRateM3PerDay
            )} m³/day`}
          />
        </div>
      )}
    </div>
  );
}

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

      <span className="font-semibold text-white">
        {value}
      </span>
    </div>
  );
}