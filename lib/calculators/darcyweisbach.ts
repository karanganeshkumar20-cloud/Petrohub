export type DarcyWeisbachInput = {
  frictionFactor: number;
  pipeLength: number;
  pipeDiameterMm: number;
  velocity: number;
  density: number;
  gravity?: number;
};

export type DarcyWeisbachResult = {
  pipeDiameterM: number;
  pressureLossPa: number;
  pressureLossKPa: number;
  pressureLossBar: number;
  headLossM: number;
  dynamicPressurePa: number;
  lengthDiameterRatio: number;
  gravity: number;
};

function validateNumber(
  value: number,
  name: string
) {
  if (!Number.isFinite(value)) {
    throw new Error(
      `${name} must be a valid number.`
    );
  }
}

export function calculateDarcyWeisbach(
  input: DarcyWeisbachInput
): DarcyWeisbachResult {
  const gravity =
    input.gravity ?? 9.80665;

  validateNumber(
    input.frictionFactor,
    "Darcy friction factor"
  );

  validateNumber(
    input.pipeLength,
    "Pipe length"
  );

  validateNumber(
    input.pipeDiameterMm,
    "Pipe diameter"
  );

  validateNumber(
    input.velocity,
    "Fluid velocity"
  );

  validateNumber(
    input.density,
    "Fluid density"
  );

  validateNumber(
    gravity,
    "Gravity"
  );

  if (input.frictionFactor <= 0) {
    throw new Error(
      "Darcy friction factor must be greater than zero."
    );
  }

  if (input.pipeLength <= 0) {
    throw new Error(
      "Pipe length must be greater than zero."
    );
  }

  if (input.pipeDiameterMm <= 0) {
    throw new Error(
      "Pipe diameter must be greater than zero."
    );
  }

  if (input.velocity < 0) {
    throw new Error(
      "Fluid velocity cannot be negative."
    );
  }

  if (input.density <= 0) {
    throw new Error(
      "Fluid density must be greater than zero."
    );
  }

  if (gravity <= 0) {
    throw new Error(
      "Gravity must be greater than zero."
    );
  }

  const pipeDiameterM =
    input.pipeDiameterMm / 1000;

  const lengthDiameterRatio =
    input.pipeLength /
    pipeDiameterM;

  const dynamicPressurePa =
    (input.density *
      input.velocity *
      input.velocity) /
    2;

  const pressureLossPa =
    input.frictionFactor *
    lengthDiameterRatio *
    dynamicPressurePa;

  const pressureLossKPa =
    pressureLossPa / 1000;

  const pressureLossBar =
    pressureLossPa / 100000;

  const headLossM =
    input.frictionFactor *
    lengthDiameterRatio *
    ((input.velocity *
      input.velocity) /
      (2 * gravity));

  return {
    pipeDiameterM,
    pressureLossPa,
    pressureLossKPa,
    pressureLossBar,
    headLossM,
    dynamicPressurePa,
    lengthDiameterRatio,
    gravity,
  };
}