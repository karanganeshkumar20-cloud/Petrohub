"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  calculateDarcyWeisbach,
  type DarcyWeisbachResult,
} from "@/lib/calculators/darcyweisbach";

type FormState = {
  frictionFactor: string;
  pipeLength: string;
  pipeDiameter: string;
  velocity: string;
  density: string;
};

const initialForm: FormState = {
  frictionFactor: "0.02",
  pipeLength: "100",
  pipeDiameter: "100",
  velocity: "2",
  density: "1000",
};

function formatNumber(
  value: number,
  digits = 3
) {
  return value.toLocaleString(
    "en-US",
    {
      maximumFractionDigits:
        digits,
    }
  );
}

export default function DarcyWeisbachCalculator() {
  const [form, setForm] =
    useState<FormState>(
      initialForm
    );

  const [result, setResult] =
    useState<DarcyWeisbachResult | null>(
      null
    );

  const [error, setError] =
    useState("");

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const calculated =
        calculateDarcyWeisbach({
          frictionFactor:
            Number(
              form.frictionFactor
            ),

          pipeLength:
            Number(
              form.pipeLength
            ),

          pipeDiameterMm:
            Number(
              form.pipeDiameter
            ),

          velocity:
            Number(
              form.velocity
            ),

          density:
            Number(
              form.density
            ),
        });

      setResult(calculated);
    } catch (err) {
      setResult(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate pressure loss."
      );
    }
  }

  function handleReset() {
    setForm(initialForm);
    setResult(null);
    setError("");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          Pipe Conditions
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Calculation Inputs
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Enter the Darcy friction
          factor and pipe flow
          conditions.
        </p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <InputField
            label="Darcy Friction Factor"
            unit="-"
            value={
              form.frictionFactor
            }
            onChange={(value) =>
              updateField(
                "frictionFactor",
                value
              )
            }
          />

          <InputField
            label="Pipe Length"
            unit="m"
            value={
              form.pipeLength
            }
            onChange={(value) =>
              updateField(
                "pipeLength",
                value
              )
            }
          />

          <InputField
            label="Internal Diameter"
            unit="mm"
            value={
              form.pipeDiameter
            }
            onChange={(value) =>
              updateField(
                "pipeDiameter",
                value
              )
            }
          />

          <InputField
            label="Fluid Velocity"
            unit="m/s"
            value={
              form.velocity
            }
            onChange={(value) =>
              updateField(
                "velocity",
                value
              )
            }
          />

          <InputField
            label="Fluid Density"
            unit="kg/m³"
            value={
              form.density
            }
            onChange={(value) =>
              updateField(
                "density",
                value
              )
            }
          />
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Calculate
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-slate-700 px-6 py-3 font-bold text-slate-300 transition hover:border-orange-500 hover:text-orange-400"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          Result
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Pipe Pressure Loss
        </h2>

        {!result ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
            Enter the pipe
            conditions and press
            Calculate.
          </div>
        ) : (
          <>
            <div className="mt-7 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
              <p className="text-sm text-orange-200">
                Pressure Loss
              </p>

              <p className="mt-2 text-4xl font-black">
                {formatNumber(
                  result.pressureLossKPa
                )}

                <span className="ml-2 text-lg font-semibold text-slate-300">
                  kPa
                </span>
              </p>

              <p className="mt-3 text-sm text-slate-300">
                {formatNumber(
                  result.pressureLossBar
                )}{" "}
                bar
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <ResultItem
                label="Head Loss"
                value={`${formatNumber(
                  result.headLossM
                )} m`}
              />

              <ResultItem
                label="Dynamic Pressure"
                value={`${formatNumber(
                  result.dynamicPressurePa
                )} Pa`}
              />

              <ResultItem
                label="Length / Diameter"
                value={formatNumber(
                  result.lengthDiameterRatio
                )}
              />

              <ResultItem
                label="Pipe Diameter"
                value={`${formatNumber(
                  result.pipeDiameterM
                )} m`}
              />
            </div>
          </>
        )}
      </div>
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
  onChange: (
    value: string
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
          value={value}
          onChange={(event) =>
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