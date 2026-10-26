"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  calculateProductivityIndex,
} from "@/lib/calculators/reservoirBatch1";

export default function ProductivityIndexCalculator() {
  const [
    productionRateStbPerDay,
    setProductionRateStbPerDay,
  ] = useState("1000");

  const [
    reservoirPressurePsi,
    setReservoirPressurePsi,
  ] = useState("3000");

  const [
    flowingBottomholePressurePsi,
    setFlowingBottomholePressurePsi,
  ] = useState("1500");

  const result = useMemo(() => {
    try {
      const calculated =
        calculateProductivityIndex({
          productionRateStbPerDay:
            Number(
              productionRateStbPerDay
            ),

          reservoirPressurePsi:
            Number(
              reservoirPressurePsi
            ),

          flowingBottomholePressurePsi:
            Number(
              flowingBottomholePressurePsi
            ),
        });

      return {
        data:
          calculated,
        error:
          "",
      };
    } catch (error) {
      return {
        data:
          null,
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate.",
      };
    }
  }, [
    productionRateStbPerDay,
    reservoirPressurePsi,
    flowingBottomholePressurePsi,
  ]);

  function resetCalculator() {
    setProductionRateStbPerDay("1000");
    setReservoirPressurePsi("3000");
    setFlowingBottomholePressurePsi("1500");
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Reservoir Calculator
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Productivity Index
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Calculate well productivity
            index from production rate,
            reservoir pressure, and
            flowing bottomhole pressure.
          </p>
        </div>

        <button
          type="button"
          onClick={
            resetCalculator
          }
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-orange-500 hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h3 className="text-lg font-bold text-white">
            Input Parameters
          </h3>

          <div className="mt-5 grid gap-5">
            <NumberField
              label="Production Rate"
              unit="STB/day"
              value={
                productionRateStbPerDay
              }
              onChange={
                setProductionRateStbPerDay
              }
            />

            <NumberField
              label="Reservoir Pressure"
              unit="psi"
              value={
                reservoirPressurePsi
              }
              onChange={
                setReservoirPressurePsi
              }
            />

            <NumberField
              label="Flowing Bottomhole Pressure"
              unit="psi"
              value={
                flowingBottomholePressurePsi
              }
              onChange={
                setFlowingBottomholePressurePsi
              }
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            Results
          </h3>

          {result.error ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm leading-6 text-red-300">
              {result.error}
            </div>
          ) : result.data ? (
            <div className="mt-5 space-y-4">
              <ResultCard
                label="Productivity Index"
                value={
                  result.data.productivityIndexStbPerDayPsi.toFixed(
                    4
                  )
                }
                unit="STB/day/psi"
              />

              <ResultCard
                label="Pressure Drawdown"
                value={
                  result.data.pressureDrawdownPsi.toFixed(
                    2
                  )
                }
                unit="psi"
              />

              <ResultCard
                label="Production Rate"
                value={
                  result.data.productionRateM3PerDay.toFixed(
                    2
                  )
                }
                unit="m3/day"
              />
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-sm font-semibold text-white">
              Reference Case
            </p>

            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p>
                q = 1000 STB/day
              </p>

              <p>
                Pr = 3000 psi
              </p>

              <p>
                Pwf = 1500 psi
              </p>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-4 text-sm text-slate-300">
              Expected PI: approximately{" "}
              <span className="font-bold text-orange-400">
                0.6667 STB/day/psi
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberField({
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

        <div className="flex items-center border-l border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-slate-400">
          {unit}
        </div>
      </div>
    </label>
  );
}

function ResultCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex flex-wrap items-end gap-2">
        <span className="text-3xl font-bold text-white">
          {value}
        </span>

        <span className="pb-1 text-sm font-semibold text-orange-400">
          {unit}
        </span>
      </div>
    </div>
  );
}