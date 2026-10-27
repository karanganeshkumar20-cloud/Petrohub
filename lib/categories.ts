export type EngineeringCategory = {
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  keywords: string[];
};

export const ENGINEERING_CATEGORIES:
  EngineeringCategory[] = [
  {
    name: "HSE",
    slug: "hse",

    seoTitle:
      "HSE Engineering Articles & Safety Resources",

    description:
      "Workplace safety, HIRA, Permit to Work, LOTO, incident investigation, risk assessment and occupational health.",

    keywords: [
      "HSE",
      "Safety Engineering",
      "Health and Safety",
      "HIRA",
      "Permit to Work",
      "PTW",
      "LOTO",
      "Risk Assessment",
    ],
  },

  {
    name: "Oil & Gas",
    slug: "oil-gas",

    seoTitle:
      "Oil & Gas Engineering Articles & Resources",

    description:
      "Petroleum engineering, drilling, production, reservoir engineering and upstream oil and gas operations.",

    keywords: [
      "Oil and Gas",
      "Petroleum Engineering",
      "Drilling Engineering",
      "Production Engineering",
      "Reservoir Engineering",
      "Upstream Oil and Gas",
    ],
  },

  {
    name: "Mechanical",
    slug: "mechanical",

    seoTitle:
      "Mechanical Engineering Articles & Resources",

    description:
      "Mechanical equipment, piping, maintenance, rotating equipment, corrosion and engineering practices.",

    keywords: [
      "Mechanical Engineering",
      "Piping Engineering",
      "Rotating Equipment",
      "Maintenance",
      "Corrosion",
    ],
  },

  {
    name: "Electrical",
    slug: "electrical",

    seoTitle:
      "Electrical Engineering Articles & Resources",

    description:
      "Electrical safety, power systems, isolation, protection systems and industrial electrical equipment.",

    keywords: [
      "Electrical Engineering",
      "Electrical Safety",
      "Power Systems",
      "Electrical Isolation",
      "Protection Systems",
    ],
  },

  {
    name: "Instrumentation",
    slug: "instrumentation",

    seoTitle:
      "Instrumentation Engineering Articles & Resources",

    description:
      "Instrumentation, sensors, transmitters, calibration, measurement and industrial control systems.",

    keywords: [
      "Instrumentation Engineering",
      "Sensors",
      "Transmitters",
      "Calibration",
      "Process Control",
      "Industrial Automation",
    ],
  },

  {
    name: "Process",
    slug: "process",

    seoTitle:
      "Process Engineering Articles & Resources",

    description:
      "Process engineering, process safety, HAZOP, industrial operations and plant systems.",

    keywords: [
      "Process Engineering",
      "Process Safety",
      "HAZOP",
      "Plant Operations",
      "Industrial Process",
    ],
  },

  {
    name: "Civil",
    slug: "civil",

    seoTitle:
      "Civil Engineering Articles & Resources",

    description:
      "Construction practices, structural systems, civil engineering fundamentals and site activities.",

    keywords: [
      "Civil Engineering",
      "Construction Engineering",
      "Structural Engineering",
      "Site Engineering",
      "Construction Safety",
    ],
  },

  {
    name: "Geology",
    slug: "geology",

    seoTitle:
      "Geology & Petroleum Geology Articles",

    description:
      "Petroleum geology, formations, reservoirs, subsurface interpretation and geological knowledge.",

    keywords: [
      "Geology",
      "Petroleum Geology",
      "Reservoir Geology",
      "Subsurface",
      "Geological Formations",
    ],
  },
];

export function getCategoryBySlug(
  slug: string
): EngineeringCategory | null {
  return (
    ENGINEERING_CATEGORIES.find(
      (category) =>
        category.slug === slug
    ) || null
  );
}