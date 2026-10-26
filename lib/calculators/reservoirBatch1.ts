/* =========================================================
   PETROHUB
   RESERVOIR ENGINEERING CALCULATORS - BATCH 1
========================================================= */

/* =========================================================
   1. DARCY'S LAW - LINEAR SINGLE-PHASE FLOW
========================================================= */

export type DarcyLinearFlowInput = {
  permeabilityMd: number;
  crossSectionalAreaFt2: number;
  pressureDropPsi: number;
  viscosityCp: number;
  flowLengthFt: number;
};

export type DarcyLinearFlowResult = {
  flowRateBblPerDay: number;
  flowRateM3PerDay: number;
};

export function calculateDarcyLinearFlow(
  input: DarcyLinearFlowInput
): DarcyLinearFlowResult {
  validatePositive(
    input.permeabilityMd,
    "Permeability"
  );

  validatePositive(
    input.crossSectionalAreaFt2,
    "Cross-sectional area"
  );

  validateNonNegative(
    input.pressureDropPsi,
    "Pressure drop"
  );

  validatePositive(
    input.viscosityCp,
    "Fluid viscosity"
  );

  validatePositive(
    input.flowLengthFt,
    "Flow length"
  );

  const flowRateBblPerDay =
    (
      0.001127 *
      input.permeabilityMd *
      input.crossSectionalAreaFt2 *
      input.pressureDropPsi
    ) /
    (
      input.viscosityCp *
      input.flowLengthFt
    );

  const flowRateM3PerDay =
    flowRateBblPerDay *
    0.158987294928;

  return {
    flowRateBblPerDay,
    flowRateM3PerDay,
  };
}

/* =========================================================
   2. VOGEL IPR
   INFLOW PERFORMANCE RELATIONSHIP
========================================================= */

export type VogelIPRInput = {
  reservoirPressurePsi: number;
  flowingBottomholePressurePsi: number;
  maxProductionRateStbPerDay: number;
};

export type VogelIPRResult = {
  productionRateStbPerDay: number;
  productionRateM3PerDay: number;
  percentOfMaxRate: number;
  pressureRatio: number;
};

export function calculateVogelIPR(
  input: VogelIPRInput
): VogelIPRResult {
  validatePositive(
    input.reservoirPressurePsi,
    "Reservoir pressure"
  );

  validateNonNegative(
    input.flowingBottomholePressurePsi,
    "Flowing bottomhole pressure"
  );

  validatePositive(
    input.maxProductionRateStbPerDay,
    "Maximum production rate"
  );

  if (
    input.flowingBottomholePressurePsi >
    input.reservoirPressurePsi
  ) {
    throw new Error(
      "Flowing bottomhole pressure cannot be greater than reservoir pressure."
    );
  }

  const pressureRatio =
    input.flowingBottomholePressurePsi /
    input.reservoirPressurePsi;

  const productionRateStbPerDay =
    input.maxProductionRateStbPerDay *
    (
      1 -
      0.2 * pressureRatio -
      0.8 * pressureRatio ** 2
    );

  const productionRateM3PerDay =
    productionRateStbPerDay *
    0.158987294928;

  const percentOfMaxRate =
    (
      productionRateStbPerDay /
      input.maxProductionRateStbPerDay
    ) *
    100;

  return {
    productionRateStbPerDay,
    productionRateM3PerDay,
    percentOfMaxRate,
    pressureRatio,
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
export type SteadyStateRadialOilFlowInput = {
  permeabilityMd: number;
  netPayFt: number;
  reservoirPressurePsi: number;
  flowingBottomholePressurePsi: number;
  oilViscosityCp: number;
  oilFormationVolumeFactor: number;
  drainageRadiusFt: number;
  wellboreRadiusFt: number;
  skinFactor: number;
};

export type SteadyStateRadialOilFlowResult = {
  productionRateStbPerDay: number;
  productionRateM3PerDay: number;
  pressureDrawdownPsi: number;
  productivityIndexStbPerDayPsi: number;
};

export function calculateSteadyStateRadialOilFlow(
  input: SteadyStateRadialOilFlowInput
): SteadyStateRadialOilFlowResult {
  validatePositive(input.permeabilityMd, "Permeability");
  validatePositive(input.netPayFt, "Net pay");
  validatePositive(input.reservoirPressurePsi, "Reservoir pressure");
  validateNonNegative(
    input.flowingBottomholePressurePsi,
    "Flowing bottomhole pressure"
  );
  validatePositive(input.oilViscosityCp, "Oil viscosity");
  validatePositive(
    input.oilFormationVolumeFactor,
    "Oil formation volume factor"
  );
  validatePositive(input.drainageRadiusFt, "Drainage radius");
  validatePositive(input.wellboreRadiusFt, "Wellbore radius");

  if (!Number.isFinite(input.skinFactor)) {
    throw new Error("Skin factor must be a valid number.");
  }

  if (
    input.flowingBottomholePressurePsi >
    input.reservoirPressurePsi
  ) {
    throw new Error(
      "Flowing bottomhole pressure cannot be greater than reservoir pressure."
    );
  }

  if (input.drainageRadiusFt <= input.wellboreRadiusFt) {
    throw new Error(
      "Drainage radius must be greater than wellbore radius."
    );
  }

  const pressureDrawdownPsi =
    input.reservoirPressurePsi -
    input.flowingBottomholePressurePsi;

  const radialFlowTerm =
    Math.log(
      input.drainageRadiusFt /
        input.wellboreRadiusFt
    ) + input.skinFactor;

  if (radialFlowTerm <= 0) {
    throw new Error(
      "ln(re/rw) + skin factor must be greater than zero."
    );
  }

  const productionRateStbPerDay =
    (0.00708 *
      input.permeabilityMd *
      input.netPayFt *
      pressureDrawdownPsi) /
    (input.oilViscosityCp *
      input.oilFormationVolumeFactor *
      radialFlowTerm);

  const productionRateM3PerDay =
    productionRateStbPerDay *
    0.158987294928;

  const productivityIndexStbPerDayPsi =
    pressureDrawdownPsi > 0
      ? productionRateStbPerDay /
        pressureDrawdownPsi
      : 0;

  return {
    productionRateStbPerDay,
    productionRateM3PerDay,
    pressureDrawdownPsi,
    productivityIndexStbPerDayPsi,
  };
}