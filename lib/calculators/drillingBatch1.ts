/* =========================================================
   PETROHUB
   DRILLING ENGINEERING CALCULATORS — BATCH 1
========================================================= */

/* =========================================================
   1. HYDROSTATIC PRESSURE
========================================================= */

export type HydrostaticPressureInput = {
  mudWeightPpg: number;
  trueVerticalDepthFt: number;
};

export type HydrostaticPressureResult = {
  pressurePsi: number;
  pressureGradientPsiPerFt: number;
};

export function calculateHydrostaticPressure(
  input: HydrostaticPressureInput
): HydrostaticPressureResult {
  validatePositive(
    input.mudWeightPpg,
    "Mud weight"
  );

  validateNonNegative(
    input.trueVerticalDepthFt,
    "True vertical depth"
  );

  const pressureGradientPsiPerFt =
    0.052 *
    input.mudWeightPpg;

  const pressurePsi =
    pressureGradientPsiPerFt *
    input.trueVerticalDepthFt;

  return {
    pressurePsi,
    pressureGradientPsiPerFt,
  };
}

/* =========================================================
   2. EQUIVALENT CIRCULATING DENSITY
========================================================= */

export type ECDInput = {
  mudWeightPpg: number;
  annularPressureLossPsi: number;
  trueVerticalDepthFt: number;
};

export type ECDResult = {
  equivalentCirculatingDensityPpg: number;
  pressureLossDensityContributionPpg: number;
};

export function calculateECD(
  input: ECDInput
): ECDResult {
  validatePositive(
    input.mudWeightPpg,
    "Mud weight"
  );

  validateNonNegative(
    input.annularPressureLossPsi,
    "Annular pressure loss"
  );

  validatePositive(
    input.trueVerticalDepthFt,
    "True vertical depth"
  );

  const pressureLossDensityContributionPpg =
    input.annularPressureLossPsi /
    (
      0.052 *
      input.trueVerticalDepthFt
    );

  const equivalentCirculatingDensityPpg =
    input.mudWeightPpg +
    pressureLossDensityContributionPpg;

  return {
    equivalentCirculatingDensityPpg,
    pressureLossDensityContributionPpg,
  };
}

/* =========================================================
   3. VELOCITY OF FLUID IN ANNULUS
========================================================= */

export type AnnularVelocityInput = {
  flowRateGpm: number;
  holeDiameterIn: number;
  pipeOuterDiameterIn: number;
};

export type AnnularVelocityResult = {
  annularVelocityFtPerSec: number;
  annularVelocityFtPerMin: number;
  diameterDifferenceSquared: number;
};

export function calculateAnnularVelocity(
  input: AnnularVelocityInput
): AnnularVelocityResult {
  validateNonNegative(
    input.flowRateGpm,
    "Flow rate"
  );

  validatePositive(
    input.holeDiameterIn,
    "Hole diameter"
  );

  validatePositive(
    input.pipeOuterDiameterIn,
    "Pipe outer diameter"
  );

  if (
    input.holeDiameterIn <=
    input.pipeOuterDiameterIn
  ) {
    throw new Error(
      "Hole diameter must be greater than pipe outer diameter."
    );
  }

  const diameterDifferenceSquared =
    input.holeDiameterIn ** 2 -
    input.pipeOuterDiameterIn ** 2;

  const annularVelocityFtPerSec =
    input.flowRateGpm /
    (
      2.448 *
      diameterDifferenceSquared
    );

  const annularVelocityFtPerMin =
    annularVelocityFtPerSec *
    60;

  return {
    annularVelocityFtPerSec,
    annularVelocityFtPerMin,
    diameterDifferenceSquared,
  };
}

/* =========================================================
   4. INITIAL CIRCULATING PRESSURE
========================================================= */

export type InitialCirculatingPressureInput = {
  slowCirculatingRatePressurePsi: number;
  shutInDrillPipePressurePsi: number;
};

export type InitialCirculatingPressureResult = {
  initialCirculatingPressurePsi: number;
};

export function calculateInitialCirculatingPressure(
  input: InitialCirculatingPressureInput
): InitialCirculatingPressureResult {
  validateNonNegative(
    input.slowCirculatingRatePressurePsi,
    "Slow circulating rate pressure"
  );

  validateNonNegative(
    input.shutInDrillPipePressurePsi,
    "Shut-in drillpipe pressure"
  );

  const initialCirculatingPressurePsi =
    input.slowCirculatingRatePressurePsi +
    input.shutInDrillPipePressurePsi;

  return {
    initialCirculatingPressurePsi,
  };
}

/* =========================================================
   VALIDATION
========================================================= */

function validateFinite(
  value: number,
  name: string
) {
  if (!Number.isFinite(value)) {
    throw new Error(
      `${name} must be a valid number.`
    );
  }
}

function validatePositive(
  value: number,
  name: string
) {
  validateFinite(
    value,
    name
  );

  if (value <= 0) {
    throw new Error(
      `${name} must be greater than zero.`
    );
  }
}

function validateNonNegative(
  value: number,
  name: string
) {
  validateFinite(
    value,
    name
  );

  if (value < 0) {
    throw new Error(
      `${name} cannot be negative.`
    );
  }
}