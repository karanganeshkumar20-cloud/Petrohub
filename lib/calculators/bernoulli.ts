/* =========================================================
   BERNOULLI EQUATION CALCULATOR
========================================================= */

export type BernoulliInput = {
  pressure1KPa: number;
  velocity1: number;
  elevation1: number;

  velocity2: number;
  elevation2: number;

  density: number;

  gravity?: number;
};

export type BernoulliResult = {
  pressure2Pa: number;
  pressure2KPa: number;

  pressureDifferencePa: number;
  pressureDifferenceKPa: number;

  pressureHead1: number;
  velocityHead1: number;
  elevationHead1: number;
  totalHead1: number;

  pressureHead2: number;
  velocityHead2: number;
  elevationHead2: number;
  totalHead2: number;

  gravity: number;
};

/* =========================================================
   VALIDATION
========================================================= */

function requireFinite(
  value: number,
  name: string
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    throw new Error(
      `${name} must be a valid number.`
    );
  }
}

/* =========================================================
   CALCULATE
========================================================= */

export function calculateBernoulli(
  input: BernoulliInput
): BernoulliResult {
  const gravity =
    input.gravity ??
    9.80665;

  requireFinite(
    input.pressure1KPa,
    "Upstream pressure"
  );

  requireFinite(
    input.velocity1,
    "Upstream velocity"
  );

  requireFinite(
    input.elevation1,
    "Upstream elevation"
  );

  requireFinite(
    input.velocity2,
    "Downstream velocity"
  );

  requireFinite(
    input.elevation2,
    "Downstream elevation"
  );

  requireFinite(
    input.density,
    "Fluid density"
  );

  requireFinite(
    gravity,
    "Gravity"
  );

  if (
    input.density <=
    0
  ) {
    throw new Error(
      "Fluid density must be greater than zero."
    );
  }

  if (
    gravity <=
    0
  ) {
    throw new Error(
      "Gravity must be greater than zero."
    );
  }

  if (
    input.velocity1 <
      0 ||
    input.velocity2 <
      0
  ) {
    throw new Error(
      "Velocity cannot be negative."
    );
  }

  const pressure1Pa =
    input.pressure1KPa *
    1000;

  /*
    Bernoulli equation:

    P1/(rho*g)
      + V1^2/(2g)
      + z1

    =

    P2/(rho*g)
      + V2^2/(2g)
      + z2

    Therefore:

    P2 =
      P1
      + 0.5*rho*(V1^2 - V2^2)
      + rho*g*(z1 - z2)
  */

  const pressure2Pa =
    pressure1Pa +
    0.5 *
      input.density *
      (
        input.velocity1 **
          2 -
        input.velocity2 **
          2
      ) +
    input.density *
      gravity *
      (
        input.elevation1 -
        input.elevation2
      );

  const pressureDifferencePa =
    pressure2Pa -
    pressure1Pa;

  const pressureHead1 =
    pressure1Pa /
    (
      input.density *
      gravity
    );

  const velocityHead1 =
    input.velocity1 **
      2 /
    (
      2 *
      gravity
    );

  const elevationHead1 =
    input.elevation1;

  const totalHead1 =
    pressureHead1 +
    velocityHead1 +
    elevationHead1;

  const pressureHead2 =
    pressure2Pa /
    (
      input.density *
      gravity
    );

  const velocityHead2 =
    input.velocity2 **
      2 /
    (
      2 *
      gravity
    );

  const elevationHead2 =
    input.elevation2;

  const totalHead2 =
    pressureHead2 +
    velocityHead2 +
    elevationHead2;

  return {
    pressure2Pa,

    pressure2KPa:
      pressure2Pa /
      1000,

    pressureDifferencePa,

    pressureDifferenceKPa:
      pressureDifferencePa /
      1000,

    pressureHead1,

    velocityHead1,

    elevationHead1,

    totalHead1,

    pressureHead2,

    velocityHead2,

    elevationHead2,

    totalHead2,

    gravity,
  };
}