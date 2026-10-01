"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  calculateBernoulli,
  type BernoulliResult,
} from "@/lib/calculators/bernoulli";

/* =========================================================
   FORM STATE
========================================================= */

type FormState = {
  pressure1:
    string;

  velocity1:
    string;

  elevation1:
    string;

  velocity2:
    string;

  elevation2:
    string;

  density:
    string;
};

const initialState: FormState = {
  pressure1:
    "200",

  velocity1:
    "2",

  elevation1:
    "0",

  velocity2:
    "4",

  elevation2:
    "5",

  density:
    "1000",
};

/* =========================================================
   NUMBER
========================================================= */

function formatNumber(
  value: number,
  digits = 3
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
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

/* =========================================================
   COMPONENT
========================================================= */

export default function BernoulliCalculator() {
  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      initialState
    );

  const [
    result,
    setResult,
  ] =
    useState<
      BernoulliResult | null
    >(
      null
    );

  const [
    error,
    setError,
  ] =
    useState("");

  function updateField(
    key:
      keyof FormState,
    value:
      string
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,
        [key]:
          value,
      })
    );
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const calculated =
        calculateBernoulli({
          pressure1KPa:
            Number(
              form.pressure1
            ),

          velocity1:
            Number(
              form.velocity1
            ),

          elevation1:
            Number(
              form.elevation1
            ),

          velocity2:
            Number(
              form.velocity2
            ),

          elevation2:
            Number(
              form.elevation2
            ),

          density:
            Number(
              form.density
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

  function resetCalculator() {
    setForm(
      initialState
    );

    setResult(
      null
    );

    setError("");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      {/* INPUT */}

      <form
        onSubmit={
          handleSubmit
        }
        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
      >
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">
            Inputs
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Flow Conditions
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            SI units are used
            throughout this
            calculator.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Upstream Pressure P₁"
            value={
              form.pressure1
            }
            unit="kPa"
            onChange={(
              value
            ) =>
              updateField(
                "pressure1",
                value
              )
            }
          />

          <Field
            label="Fluid Density ρ"
            value={
              form.density
            }
            unit="kg/m³"
            onChange={(
              value
            ) =>
              updateField(
                "density",
                value
              )
            }
          />

          <Field
            label="Upstream Velocity V₁"
            value={
              form.velocity1
            }
            unit="m/s"
            onChange={(
              value
            ) =>
              updateField(
                "velocity1",
                value
              )
            }
          />

          <Field
            label="Downstream Velocity V₂"
            value={
              form.velocity2
            }
            unit="m/s"
            onChange={(
              value
            ) =>
              updateField(
                "velocity2",
                value
              )
            }
          />

          <Field
            label="Upstream Elevation z₁"
            value={
              form.elevation1
            }
            unit="m"
            onChange={(
              value
            ) =>
              updateField(
                "elevation1",
                value
              )
            }
          />

          <Field
            label="Downstream Elevation z₂"
            value={
              form.elevation2
            }
            unit="m"
            onChange={(
              value
            ) =>
              updateField(
                "elevation2",
                value
              )
            }
          />
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Calculate
          </button>

          <button
            type="button"
            onClick={
              resetCalculator
            }
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Reset
          </button>
        </div>
      </form>

      {/* RESULT */}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-400">
          Result
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Downstream Pressure
        </h2>

        {!result ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
            Enter the flow
            conditions and press
            Calculate.
          </div>
        ) : (
          <>
            <div className="mt-7 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
              <p className="text-sm text-orange-200">
                P₂
              </p>

              <p className="mt-2 text-4xl font-black text-white">
                {formatNumber(
                  result.pressure2KPa
                )}
                <span className="ml-2 text-lg font-semibold text-slate-300">
                  kPa
                </span>
              </p>

              <p className="mt-3 text-sm text-slate-300">
                Pressure change:{" "}
                {formatNumber(
                  result.pressureDifferenceKPa
                )}{" "}
                kPa
              </p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="px-3 py-3">
                      Head
                    </th>

                    <th className="px-3 py-3">
                      Point 1
                    </th>

                    <th className="px-3 py-3">
                      Point 2
                    </th>
                  </tr>
                </thead>

                <tbody className="text-slate-200">
                  <ResultRow
                    label="Pressure head"
                    point1={
                      result.pressureHead1
                    }
                    point2={
                      result.pressureHead2
                    }
                  />

                  <ResultRow
                    label="Velocity head"
                    point1={
                      result.velocityHead1
                    }
                    point2={
                      result.velocityHead2
                    }
                  />

                  <ResultRow
                    label="Elevation head"
                    point1={
                      result.elevationHead1
                    }
                    point2={
                      result.elevationHead2
                    }
                  />

                  <ResultRow
                    label="Total head"
                    point1={
                      result.totalHead1
                    }
                    point2={
                      result.totalHead2
                    }
                    strong
                  />
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  value,
  unit,
  onChange,
}: {
  label:
    string;

  value:
    string;

  unit:
    string;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
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
              event.target.value
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
   RESULT ROW
========================================================= */

function ResultRow({
  label,
  point1,
  point2,
  strong = false,
}: {
  label:
    string;

  point1:
    number;

  point2:
    number;

  strong?:
    boolean;
}) {
  return (
    <tr
      className={`border-b border-slate-800 ${
        strong
          ? "font-bold text-white"
          : ""
      }`}
    >
      <td className="px-3 py-3">
        {label}
      </td>

      <td className="px-3 py-3">
        {formatNumber(
          point1
        )}{" "}
        m
      </td>

      <td className="px-3 py-3">
        {formatNumber(
          point2
        )}{" "}
        m
      </td>
    </tr>
  );
}