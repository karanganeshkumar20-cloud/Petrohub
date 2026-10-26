"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  calculateSteadyStateRadialOilFlow,
} from "@/lib/calculators/reservoirBatch1";

export default function SteadyStateRadialOilCalculator() {
  const [
    permeabilityMd,
    setPermeabilityMd,
  ] = useState("50");

  const [
    netPayFt,
    setNetPayFt,
  ] = useState("30");

  const [
    reservoirPressurePsi,
    setReservoirPressurePsi,
  ] = useState("3000");

  const [
    flowingBottomholePressurePsi,
    setFlowingBottomholePressurePsi,
  ] = useState("1500");

  const [
    oilViscosityCp,
    setOilViscosityCp,
  ] = useState("2");

  const [
    oilFormationVolumeFactor,
    setOilFormationVolumeFactor,
  ] = useState("1.2");

  const [
    drainageRadiusFt,
    setDrainageRadiusFt,
  ] = useState("1000");

  const [
    wellboreRadiusFt,
    setWellboreRadiusFt,
  ] = useState("0.25");

  const [
    skinFactor,
    setSkinFactor,
  ] = useState("0");

  const result = useMemo(() => {
    try {
      const calculated =
        calculateSteadyStateRadialOilFlow({
          permeabilityMd:
            Number(permeabilityMd),

          netPayFt:
            Number(netPayFt),

          reservoirPressurePsi:
            Number(reservoirPressurePsi),

          flowingBottomholePressurePsi:
            Number(
              flowingBottomholePressurePsi
            ),

          oilViscosityCp:
            Number(oilViscosityCp),

          oilFormationVolumeFactor:
            Number(
              oilFormationVolumeFactor
            ),

          drainageRadiusFt:
            Number(drainageRadiusFt),

          wellboreRadiusFt:
            Number(wellboreRadiusFt),

          skinFactor:
            Number(skinFactor),
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
    permeabilityMd,
    netPayFt,
    reservoirPressurePsi,
    flowingBottomholePressurePsi,
    oilViscosityCp,
    oilFormationVolumeFactor,
    drainageRadiusFt,
    wellboreRadiusFt,
    skinFactor,
  ]);

  function resetCalculator() {
    setPermeabilityMd("50");
    setNetPayFt("30");
    setReservoirPressurePsi("3000");
    setFlowingBottomholePressurePsi("1500");
    setOilViscosityCp("2");
    setOilFormationVolumeFactor("1.2");
    setDrainageRadiusFt("1000");
    setWellboreRadiusFt("0.25");
    setSkinFactor("0");
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            Reservoir Calculator
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Steady-State Radial Oil Flow
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Estimate oil production rate for steady-state radial
            flow toward a well using permeability, reservoir
            geometry, fluid properties, pressure drawdown, and
            skin.
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h3 className="text-lg font-bold text-white">
            Input Parameters
          </h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <NumberField
              label="Permeability"
              unit="mD"
              value={
                permeabilityMd
              }
              onChange={
                setPermeabilityMd
              }
            />

            <NumberField
              label="Net Pay Thickness"
              unit="ft"
              value={
                netPayFt
              }
              onChange={
                setNetPayFt
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

            <NumberField
              label="Oil Viscosity"
              unit="cP"
              value={
                oilViscosityCp
              }
              onChange={
                setOilViscosityCp
              }
            />

            <NumberField
              label="Oil Formation Volume Factor"
              unit="rb/STB"
              value={
                oilFormationVolumeFactor
              }
              onChange={
                setOilFormationVolumeFactor
              }
            />

            <NumberField
              label="Drainage Radius"
              unit="ft"
              value={
                drainageRadiusFt
              }
              onChange={
                setDrainageRadiusFt
              }
            />

            <NumberField
              label="Wellbore Radius"
              unit="ft"
              value={
                wellboreRadiusFt
              }
              onChange={
                setWellboreRadiusFt
              }
            />

            <NumberField
              label="Skin Factor"
              unit="dimensionless"
              value={
                skinFactor
              }
              onChange={
                setSkinFactor
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
                label="Oil Production Rate"
                value={
                  result.data.productionRateStbPerDay.toFixed(
                    2
                  )
                }
                unit="STB/day"
              />

              <ResultCard
                label="Oil Production Rate"
                value={
                  result.data.productionRateM3PerDay.toFixed(
                    2
                  )
                }
                unit="m3/day"
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
                label="Productivity Index"
                value={
                  result.data.productivityIndexStbPerDayPsi.toFixed(
                    4
                  )
                }
                unit="STB/day/psi"
              />
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-sm font-semibold text-white">
              Reference Case
            </p>

            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p>
                k = 50 mD
              </p>

              <p>
                h = 30 ft
              </p>

              <p>
                Pe = 3000 psi
              </p>

              <p>
                Pwf = 1500 psi
              </p>

              <p>
                mu = 2 cP
              </p>

              <p>
                Bo = 1.2 rb/STB
              </p>

              <p>
                re = 1000 ft
              </p>

              <p>
                rw = 0.25 ft
              </p>

              <p>
                Skin = 0
              </p>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-4 text-sm text-slate-300">
              Expected rate: approximately{" "}
              <span className="font-bold text-orange-400">
                800.27 STB/day
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