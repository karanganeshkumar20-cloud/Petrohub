"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  calculateHydrostaticPressure,
  calculateECD,
  calculateAnnularVelocity,
  calculateInitialCirculatingPressure,
} from "@/lib/calculators/drillingBatch1";

type CalculatorType =
  | "hydrostatic-pressure"
  | "ecd"
  | "annular-velocity"
  | "initial-circulating-pressure";

type Props = {
  calculator:
    CalculatorType;
};

/* =========================================================
   FORMAT
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

export default function DrillingBatch1Calculator({
  calculator,
}: Props) {
  if (
    calculator ===
    "hydrostatic-pressure"
  ) {
    return (
      <HydrostaticPressureCalculator />
    );
  }

  if (
    calculator ===
    "ecd"
  ) {
    return (
      <ECDCalculator />
    );
  }

  if (
    calculator ===
    "annular-velocity"
  ) {
    return (
      <AnnularVelocityCalculator />
    );
  }

  return (
    <InitialCirculatingPressureCalculator />
  );
}

/* =========================================================
   HYDROSTATIC PRESSURE
========================================================= */

function HydrostaticPressureCalculator() {
  const [
    mudWeight,
    setMudWeight,
  ] =
    useState("10");

  const [
    depth,
    setDepth,
  ] =
    useState("10000");

  const [
    result,
    setResult,
  ] =
    useState<{
      pressurePsi:
        number;

      pressureGradientPsiPerFt:
        number;
    } | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState("");

  function calculate(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const calculated =
        calculateHydrostaticPressure({
          mudWeightPpg:
            Number(
              mudWeight
            ),

          trueVerticalDepthFt:
            Number(
              depth
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
        getError(
          err
        )
      );
    }
  }

  return (
    <CalculatorShell
      title="Hydrostatic Pressure"
      description="Calculate hydrostatic pressure from mud weight and true vertical depth."
      onSubmit={
        calculate
      }
      onReset={() => {
        setMudWeight(
          "10"
        );

        setDepth(
          "10000"
        );

        setResult(
          null
        );

        setError("");
      }}
      error={
        error
      }
      fields={
        <>
          <InputField
            label="Mud Weight MW"
            unit="ppg"
            value={
              mudWeight
            }
            onChange={
              setMudWeight
            }
          />

          <InputField
            label="True Vertical Depth TVD"
            unit="ft"
            value={
              depth
            }
            onChange={
              setDepth
            }
          />
        </>
      }
      result={
        result ? (
          <>
            <PrimaryResult
              label="Hydrostatic Pressure"
              value={`${formatNumber(
                result.pressurePsi
              )} psi`}
            />

            <ResultItem
              label="Pressure Gradient"
              value={`${formatNumber(
                result.pressureGradientPsiPerFt,
                4
              )} psi/ft`}
            />
          </>
        ) : null
      }
    />
  );
}

/* =========================================================
   ECD
========================================================= */

function ECDCalculator() {
  const [
    mudWeight,
    setMudWeight,
  ] =
    useState("10");

  const [
    annularLoss,
    setAnnularLoss,
  ] =
    useState("500");

  const [
    depth,
    setDepth,
  ] =
    useState("10000");

  const [
    result,
    setResult,
  ] =
    useState<{
      equivalentCirculatingDensityPpg:
        number;

      pressureLossDensityContributionPpg:
        number;
    } | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState("");

  function calculate(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const calculated =
        calculateECD({
          mudWeightPpg:
            Number(
              mudWeight
            ),

          annularPressureLossPsi:
            Number(
              annularLoss
            ),

          trueVerticalDepthFt:
            Number(
              depth
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
        getError(
          err
        )
      );
    }
  }

  return (
    <CalculatorShell
      title="Equivalent Circulating Density"
      description="Calculate ECD from mud weight, annular pressure loss and true vertical depth."
      onSubmit={
        calculate
      }
      onReset={() => {
        setMudWeight(
          "10"
        );

        setAnnularLoss(
          "500"
        );

        setDepth(
          "10000"
        );

        setResult(
          null
        );

        setError("");
      }}
      error={
        error
      }
      fields={
        <>
          <InputField
            label="Mud Weight MW"
            unit="ppg"
            value={
              mudWeight
            }
            onChange={
              setMudWeight
            }
          />

          <InputField
            label="Annular Pressure Loss ΔPa"
            unit="psi"
            value={
              annularLoss
            }
            onChange={
              setAnnularLoss
            }
          />

          <InputField
            label="True Vertical Depth TVD"
            unit="ft"
            value={
              depth
            }
            onChange={
              setDepth
            }
          />
        </>
      }
      result={
        result ? (
          <>
            <PrimaryResult
              label="Equivalent Circulating Density"
              value={`${formatNumber(
                result.equivalentCirculatingDensityPpg
              )} ppg`}
            />

            <ResultItem
              label="Pressure-Loss Contribution"
              value={`${formatNumber(
                result.pressureLossDensityContributionPpg
              )} ppg`}
            />
          </>
        ) : null
      }
    />
  );
}

/* =========================================================
   ANNULAR VELOCITY
========================================================= */

function AnnularVelocityCalculator() {
  const [
    flowRate,
    setFlowRate,
  ] =
    useState("500");

  const [
    holeDiameter,
    setHoleDiameter,
  ] =
    useState("12.25");

  const [
    pipeDiameter,
    setPipeDiameter,
  ] =
    useState("5");

  const [
    result,
    setResult,
  ] =
    useState<{
      annularVelocityFtPerSec:
        number;

      annularVelocityFtPerMin:
        number;

      diameterDifferenceSquared:
        number;
    } | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState("");

  function calculate(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const calculated =
        calculateAnnularVelocity({
          flowRateGpm:
            Number(
              flowRate
            ),

          holeDiameterIn:
            Number(
              holeDiameter
            ),

          pipeOuterDiameterIn:
            Number(
              pipeDiameter
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
        getError(
          err
        )
      );
    }
  }

  return (
    <CalculatorShell
      title="Annular Fluid Velocity"
      description="Calculate fluid velocity in the annulus using flow rate and annular geometry."
      onSubmit={
        calculate
      }
      onReset={() => {
        setFlowRate(
          "500"
        );

        setHoleDiameter(
          "12.25"
        );

        setPipeDiameter(
          "5"
        );

        setResult(
          null
        );

        setError("");
      }}
      error={
        error
      }
      fields={
        <>
          <InputField
            label="Flow Rate Q"
            unit="gpm"
            value={
              flowRate
            }
            onChange={
              setFlowRate
            }
          />

          <InputField
            label="Outer / Hole Diameter Do"
            unit="in"
            value={
              holeDiameter
            }
            onChange={
              setHoleDiameter
            }
          />

          <InputField
            label="Pipe Outer Diameter Dp"
            unit="in"
            value={
              pipeDiameter
            }
            onChange={
              setPipeDiameter
            }
          />
        </>
      }
      result={
        result ? (
          <>
            <PrimaryResult
              label="Annular Velocity"
              value={`${formatNumber(
                result.annularVelocityFtPerSec
              )} ft/s`}
            />

            <ResultItem
              label="Velocity"
              value={`${formatNumber(
                result.annularVelocityFtPerMin
              )} ft/min`}
            />

            <ResultItem
              label="Do² − Dp²"
              value={formatNumber(
                result.diameterDifferenceSquared
              )}
            />
          </>
        ) : null
      }
    />
  );
}

/* =========================================================
   INITIAL CIRCULATING PRESSURE
========================================================= */

function InitialCirculatingPressureCalculator() {
  const [
    scrp,
    setScrp,
  ] =
    useState("600");

  const [
    sidpp,
    setSidpp,
  ] =
    useState("400");

  const [
    result,
    setResult,
  ] =
    useState<{
      initialCirculatingPressurePsi:
        number;
    } | null>(
      null
    );

  const [
    error,
    setError,
  ] =
    useState("");

  function calculate(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    try {
      const calculated =
        calculateInitialCirculatingPressure({
          slowCirculatingRatePressurePsi:
            Number(
              scrp
            ),

          shutInDrillPipePressurePsi:
            Number(
              sidpp
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
        getError(
          err
        )
      );
    }
  }

  return (
    <CalculatorShell
      title="Initial Circulating Pressure"
      description="Calculate ICP from slow circulating rate pressure and shut-in drillpipe pressure."
      onSubmit={
        calculate
      }
      onReset={() => {
        setScrp(
          "600"
        );

        setSidpp(
          "400"
        );

        setResult(
          null
        );

        setError("");
      }}
      error={
        error
      }
      fields={
        <>
          <InputField
            label="Slow Circulating Rate Pressure SCRP"
            unit="psi"
            value={
              scrp
            }
            onChange={
              setScrp
            }
          />

          <InputField
            label="Shut-In Drillpipe Pressure SIDPP"
            unit="psi"
            value={
              sidpp
            }
            onChange={
              setSidpp
            }
          />
        </>
      }
      result={
        result ? (
          <PrimaryResult
            label="Initial Circulating Pressure"
            value={`${formatNumber(
              result.initialCirculatingPressurePsi
            )} psi`}
          />
        ) : null
      }
    />
  );
}

/* =========================================================
   CALCULATOR SHELL
========================================================= */

function CalculatorShell({
  title,
  description,
  fields,
  result,
  error,
  onSubmit,
  onReset,
}: {
  title:
    string;

  description:
    string;

  fields:
    React.ReactNode;

  result:
    React.ReactNode;

  error:
    string;

  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>
    ) => void;

  onReset:
    () => void;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        onSubmit={
          onSubmit
        }
        className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
          Inputs
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          {description}
        </p>

        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {fields}
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
            onClick={
              onReset
            }
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
          Calculation Result
        </h2>

        {!result ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
            Enter the required
            values and press
            Calculate.
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  unit,
  value,
  onChange,
}: {
  label:
    string;

  unit:
    string;

  value:
    string;

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
   PRIMARY RESULT
========================================================= */

function PrimaryResult({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6">
      <p className="text-sm text-orange-200">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   RESULT ITEM
========================================================= */

function ResultItem({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
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

/* =========================================================
   ERROR
========================================================= */

function getError(
  error: unknown
) {
  return error instanceof Error
    ? error.message
    : "Unable to calculate.";
}