"use client";

import {
  useAnalyticsRange,
} from "@/lib/useAnalyticsRange";
import {
  useState,
} from "react";

import type {
  Cell,
  Worksheet,
} from "exceljs";

/* =========================================================
   TYPES
========================================================= */

type RangeDays =
  | 7
  | 30
  | 90;

type TrendStatus =
  | "up"
  | "down"
  | "same"
  | "new";

type ComparisonMetric = {
  current: number;

  previous: number;

  changePercent:
    | number
    | null;

  trend:
    TrendStatus;
};

type TrafficItem = {
  date: string;

  views: number;

  articleViews: number;

  bookViews: number;

  downloads: number;

  newUsers: number;
};

type TopArticle = {
  _id?: string;

  title: string;

  slug: string;

  category?: string;

  views?: number;
};

type TopBook = {
  _id?: string;

  title: string;

  slug: string;

  category?: string;

  views?: number;

  downloads?: number;
};

type TopDownloadedBook = {
  _id?: string;

  title: string;

  slug: string;

  category?: string;

  downloads?: number;
};

type TopSavedItem = {
  itemType:
    | "article"
    | "book";

  title: string;

  slug: string;

  category?: string;

  saves: number;
};

type OverviewAnalytics = {
  success: boolean;

  range?: {
    days: number;

    startDate: string;

    endDate: string;
  };

  summary?: {
    users?: number;

    articles?: number;

    books?: number;

    bookmarks?: number;

    history?: number;

    messages?: number;

    views?: number;

    articleViews?: number;

    bookViews?: number;

    downloads?: number;

    uniqueVisitors?: number;

    uniqueDownloaders?: number;

    newUsers?: number;
  };

  totals?: {
    users?: number;

    articles?: number;

    books?: number;

    bookmarks?: number;

    history?: number;

    messages?: number;

    views?: number;

    articleViews?: number;

    bookViews?: number;

    downloads?: number;

    uniqueVisitors?: number;

    uniqueDownloaders?: number;

    newUsers?: number;
  };

  comparison?: {
    previousRange?: {
      startDate: string;

      endDate: string;
    };

    views?:
      ComparisonMetric;

    uniqueVisitors?:
      ComparisonMetric;

    downloads?:
      ComparisonMetric;

    uniqueDownloaders?:
      ComparisonMetric;

    articleViews?:
      ComparisonMetric;

    bookViews?:
      ComparisonMetric;

    newUsers?:
      ComparisonMetric;
  };

  traffic?: TrafficItem[];

  topArticles?: TopArticle[];

  topBooks?: TopBook[];

  topDownloadedBooks?:
    TopDownloadedBook[];

  topSaved?:
    TopSavedItem[];
};

/* =========================================================
   CATEGORY TYPES
========================================================= */

type CategoryItem = {
  category: string;

  articles: number;

  resources: number;

  totalContent: number;

  views: number;

  articleViews: number;

  bookViews: number;

  downloads: number;

  bookmarks: number;

  score: number;
};

type CategoryAnalytics = {
  success: boolean;

  range: {
    days: number;

    startDate: string;

    endDate: string;
  };

  summary: {
    categories: number;

    views: number;

    articleViews: number;

    bookViews: number;

    downloads: number;

    bookmarks: number;

    totalContent: number;

    articles: number;

    resources: number;
  };

  categories:
    CategoryItem[];
};

/* =========================================================
   TRENDING TYPES
========================================================= */

type TrendingContentItem = {
  rank: number;

  itemType:
    | "article"
    | "book";

  itemId: string;

  title: string;

  slug: string;

  category: string;

  contentType?: string;

  views: number;

  previousViews: number;

  downloads: number;

  previousDownloads: number;

  currentEngagement: number;

  previousEngagement: number;

  growthPercent:
    | number
    | null;

  trend:
    TrendStatus;

  momentumScore: number;
};

type TrendingCategoryItem = {
  rank: number;

  category: string;

  views: number;

  previousViews: number;

  downloads: number;

  previousDownloads: number;

  currentEngagement: number;

  previousEngagement: number;

  growthPercent:
    | number
    | null;

  trend:
    TrendStatus;

  momentumScore: number;

  activeContent: number;
};

type TrendingAnalytics = {
  success: boolean;

  range: {
    days: number;

    startDate: string;

    endDate: string;

    previousStartDate: string;

    previousEndDate: string;
  };

  summary: {
    trackedContent: number;

    risingContent: number;

    decliningContent: number;

    views: number;

    downloads: number;

    trendingCategories: number;
  };

  trendingContent:
    TrendingContentItem[];

  trendingCategories:
    TrendingCategoryItem[];
};

/* =========================================================
   COLOURS
========================================================= */

const EXCEL = {
  background:
    "FF020617",

  panel:
    "FF0F172A",

  panelLight:
    "FF1E293B",

  border:
    "FF334155",

  white:
    "FFFFFFFF",

  muted:
    "FF94A3B8",

  orange:
    "FFF97316",

  green:
    "FF22C55E",

  blue:
    "FF3B82F6",

  cyan:
    "FF06B6D4",

  purple:
    "FFA855F7",

  pink:
    "FFEC4899",

  yellow:
    "FFEAB308",

  red:
    "FFEF4444",
};

const CHART = {
  background:
    "#0f172a",

  plot:
    "#020617",

  white:
    "#ffffff",

  muted:
    "#94a3b8",

  grid:
    "#334155",

  orange:
    "#f97316",

  green:
    "#22c55e",

  blue:
    "#3b82f6",

  cyan:
    "#06b6d4",

  purple:
    "#a855f7",

  pink:
    "#ec4899",

  yellow:
    "#eab308",
};

/* =========================================================
   BASIC HELPERS
========================================================= */

function numberValue(
  value:
    | number
    | undefined
    | null
) {
  return Number(
    value ?? 0
  );
}

function formatNumber(
  value: number
) {
  return value.toLocaleString(
    "en-IN"
  );
}

function formatCompact(
  value: number
) {
  if (
    value >= 1000000
  ) {
    return `${(
      value /
      1000000
    ).toFixed(1)}M`;
  }

  if (
    value >= 1000
  ) {
    return `${(
      value /
      1000
    ).toFixed(1)}K`;
  }

  return String(
    Math.round(
      value
    )
  );
}

function cleanDate(
  value?: string
) {
  if (!value) {
    return "";
  }

  return value.slice(
    0,
    10
  );
}

function shortDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",
    }
  );
}

function trendText(
  trend: TrendStatus
) {
  if (
    trend === "up"
  ) {
    return "Growing";
  }

  if (
    trend === "down"
  ) {
    return "Declining";
  }

  if (
    trend === "new"
  ) {
    return "New Activity";
  }

  return "No Change";
}

function growthText(
  value:
    | number
    | null
) {
  if (
    value === null
  ) {
    return "New";
  }

  return `${value}%`;
}

/* =========================================================
   EXCEL CELL HELPERS
========================================================= */

function applyBorder(
  cell: Cell
) {
  cell.border = {
    top: {
      style:
        "thin",

      color: {
        argb:
          EXCEL.border,
      },
    },

    left: {
      style:
        "thin",

      color: {
        argb:
          EXCEL.border,
      },
    },

    bottom: {
      style:
        "thin",

      color: {
        argb:
          EXCEL.border,
      },
    },

    right: {
      style:
        "thin",

      color: {
        argb:
          EXCEL.border,
      },
    },
  };
}

function styleHeaderCell(
  cell: Cell
) {
  cell.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        EXCEL.panelLight,
    },
  };

  cell.font = {
    bold: true,

    color: {
      argb:
        EXCEL.white,
    },

    size: 11,
  };

  cell.alignment = {
    vertical:
      "middle",

    horizontal:
      "center",
  };

  applyBorder(
    cell
  );
}

function styleDataCell(
  cell: Cell,
  rowNumber: number
) {
  cell.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        rowNumber % 2 === 0
          ? "FF0B1220"
          : EXCEL.panel,
    },
  };

  cell.font = {
    color: {
      argb:
        EXCEL.white,
    },

    size: 10,
  };

  cell.alignment = {
    vertical:
      "middle",
  };

  applyBorder(
    cell
  );
}

function prepareDataSheet(
  worksheet: Worksheet,
  title: string,
  subtitle: string,
  columns: number
) {
  /* =====================================================
     PAGE SETUP
  ===================================================== */

  worksheet.pageSetup = {
    ...worksheet.pageSetup,

    orientation:
      "landscape",

    fitToPage:
      true,

    fitToWidth:
      1,

    fitToHeight:
      0,
  };

  /* =====================================================
     FREEZE HEADER
  ===================================================== */

  worksheet.views = [
    {
      state:
        "frozen",

      ySplit:
        4,
    },
  ];

  /* =====================================================
     TITLE
  ===================================================== */

  worksheet.mergeCells(
    1,
    1,
    1,
    columns
  );

  const titleCell =
    worksheet.getCell(
      1,
      1
    );

  titleCell.value =
    title;

  titleCell.font = {
    bold:
      true,

    size:
      20,

    color: {
      argb:
        EXCEL.white,
    },
  };

  titleCell.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        EXCEL.background,
    },
  };

  titleCell.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  worksheet.getRow(
    1
  ).height =
    34;

  /* =====================================================
     SUBTITLE
  ===================================================== */

  worksheet.mergeCells(
    2,
    1,
    2,
    columns
  );

  const subtitleCell =
    worksheet.getCell(
      2,
      1
    );

  subtitleCell.value =
    subtitle;

  subtitleCell.font = {
    size:
      10,

    color: {
      argb:
        EXCEL.muted,
    },
  };

  subtitleCell.fill = {
    type:
      "pattern",

    pattern:
      "solid",

    fgColor: {
      argb:
        EXCEL.background,
    },
  };

  subtitleCell.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  worksheet.getRow(
    2
  ).height =
    24;

  /* =====================================================
     SPACER
  ===================================================== */

  for (
    let column = 1;
    column <= columns;
    column += 1
  ) {
    const spacer =
      worksheet.getCell(
        3,
        column
      );

    spacer.fill = {
      type:
        "pattern",

      pattern:
        "solid",

      fgColor: {
        argb:
          EXCEL.background,
      },
    };
  }

  worksheet.getRow(
    3
  ).height =
    8;
}

function styleTable(
  worksheet: Worksheet,
  headerRow: number,
  lastRow: number,
  lastColumn: number
) {
  const header =
    worksheet.getRow(
      headerRow
    );

  header.height =
    28;

  for (
    let column = 1;
    column <= lastColumn;
    column += 1
  ) {
    styleHeaderCell(
      header.getCell(
        column
      )
    );
  }

  for (
    let row =
      headerRow + 1;
    row <= lastRow;
    row += 1
  ) {
    const current =
      worksheet.getRow(
        row
      );

    current.height =
      23;

    for (
      let column = 1;
      column <= lastColumn;
      column += 1
    ) {
      styleDataCell(
        current.getCell(
          column
        ),
        row
      );
    }
  }

  worksheet.autoFilter = {
    from: {
      row:
        headerRow,

      column: 1,
    },

    to: {
      row:
        headerRow,

      column:
        lastColumn,
    },
  };
}

/* =========================================================
   DASHBOARD HELPERS
========================================================= */

function fillDashboardArea(
  worksheet: Worksheet,
  startRow: number,
  endRow: number,
  startColumn: number,
  endColumn: number
) {
  for (
    let row =
      startRow;
    row <= endRow;
    row += 1
  ) {
    for (
      let column =
        startColumn;
      column <=
      endColumn;
      column += 1
    ) {
      const cell =
        worksheet.getCell(
          row,
          column
        );

      cell.fill = {
        type:
          "pattern",

        pattern:
          "solid",

        fgColor: {
          argb:
            EXCEL.background,
        },
      };
    }
  }
}

function addKpiCard(
  worksheet: Worksheet,
  startColumn: number,
  endColumn: number,
  startRow: number,
  title: string,
  value:
    | string
    | number,
  subtitle: string,
  accent:
    string
) {
  const endRow =
    startRow + 3;

  for (
    let row =
      startRow;
    row <= endRow;
    row += 1
  ) {
    for (
      let column =
        startColumn;
      column <=
      endColumn;
      column += 1
    ) {
      const cell =
        worksheet.getCell(
          row,
          column
        );

      cell.fill = {
        type:
          "pattern",

        pattern:
          "solid",

        fgColor: {
          argb:
            EXCEL.panel,
        },
      };

      applyBorder(
        cell
      );
    }
  }

  worksheet.mergeCells(
    startRow,
    startColumn,
    startRow,
    endColumn
  );

  worksheet.mergeCells(
    startRow + 1,
    startColumn,
    startRow + 2,
    endColumn
  );

  worksheet.mergeCells(
    startRow + 3,
    startColumn,
    startRow + 3,
    endColumn
  );

  const titleCell =
    worksheet.getCell(
      startRow,
      startColumn
    );

  titleCell.value =
    title;

  titleCell.font = {
    bold: true,

    size: 10,

    color: {
      argb:
        EXCEL.muted,
    },
  };

  titleCell.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  const valueCell =
    worksheet.getCell(
      startRow + 1,
      startColumn
    );

  valueCell.value =
    value;

  valueCell.font = {
    bold: true,

    size: 24,

    color: {
      argb:
        accent,
    },
  };

  valueCell.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };

  const subtitleCell =
    worksheet.getCell(
      startRow + 3,
      startColumn
    );

  subtitleCell.value =
    subtitle;

  subtitleCell.font = {
    size: 9,

    color: {
      argb:
        EXCEL.muted,
    },
  };

  subtitleCell.alignment = {
    vertical:
      "middle",

    horizontal:
      "left",
  };
}

/* =========================================================
   CANVAS HELPERS
========================================================= */

function createCanvas(
  width: number,
  height: number
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    throw new Error(
      "Unable to create chart canvas."
    );
  }

  context.fillStyle =
    CHART.background;

  context.fillRect(
    0,
    0,
    width,
    height
  );

  return {
    canvas,
    context,
  };
}

function drawChartHeading(
  context:
    CanvasRenderingContext2D,
  title: string,
  subtitle: string
) {
  context.fillStyle =
    CHART.white;

  context.font =
    "bold 34px Arial";

  context.fillText(
    title,
    48,
    52
  );

  context.fillStyle =
    CHART.muted;

  context.font =
    "20px Arial";

  context.fillText(
    subtitle,
    48,
    84
  );
}

/* =========================================================
   LINE CHART
========================================================= */

function createLineChart(
  title: string,
  subtitle: string,
  labels: string[],
  series: {
    name: string;

    values: number[];

    color: string;
  }[]
) {
  const width =
    1200;

  const height =
    560;

  const {
    canvas,
    context,
  } =
    createCanvas(
      width,
      height
    );

  drawChartHeading(
    context,
    title,
    subtitle
  );

  const plotLeft =
    90;

  const plotTop =
    135;

  const plotWidth =
    1050;

  const plotHeight =
    340;

  let maximum =
    0;

  for (
    const item of
    series
  ) {
    for (
      const value of
      item.values
    ) {
      maximum =
        Math.max(
          maximum,
          value
        );
    }
  }

  maximum =
    Math.max(
      maximum,
      1
    );

  const roundedMaximum =
    maximum <= 5
      ? 5
      : Math.ceil(
          maximum /
            5
        ) * 5;

  /* GRID */

  for (
    let line = 0;
    line <= 5;
    line += 1
  ) {
    const y =
      plotTop +
      (plotHeight /
        5) *
        line;

    context.strokeStyle =
      CHART.grid;

    context.lineWidth =
      1;

    context.beginPath();

    context.moveTo(
      plotLeft,
      y
    );

    context.lineTo(
      plotLeft +
        plotWidth,
      y
    );

    context.stroke();

    const value =
      roundedMaximum -
      (roundedMaximum /
        5) *
        line;

    context.fillStyle =
      CHART.muted;

    context.font =
      "18px Arial";

    context.textAlign =
      "right";

    context.fillText(
      formatCompact(
        value
      ),
      plotLeft - 16,
      y + 6
    );
  }

  /* X LABELS */

  const labelStep =
    Math.max(
      1,
      Math.ceil(
        labels.length /
          7
      )
    );

  labels.forEach(
    (
      label,
      index
    ) => {
      if (
        index %
          labelStep !==
          0 &&
        index !==
          labels.length -
            1
      ) {
        return;
      }

      const x =
        labels.length <=
        1
          ? plotLeft
          : plotLeft +
            (index /
              (labels.length -
                1)) *
              plotWidth;

      context.fillStyle =
        CHART.muted;

      context.font =
        "17px Arial";

      context.textAlign =
        "center";

      context.fillText(
        label,
        x,
        plotTop +
          plotHeight +
          38
      );
    }
  );

  /* SERIES */

  series.forEach(
    (
      item,
      seriesIndex
    ) => {
      context.strokeStyle =
        item.color;

      context.lineWidth =
        5;

      context.lineJoin =
        "round";

      context.lineCap =
        "round";

      context.beginPath();

      item.values.forEach(
        (
          value,
          index
        ) => {
          const x =
            item.values
              .length <= 1
              ? plotLeft
              : plotLeft +
                (index /
                  (item.values
                    .length -
                    1)) *
                  plotWidth;

          const y =
            plotTop +
            plotHeight -
            (value /
              roundedMaximum) *
              plotHeight;

          if (
            index === 0
          ) {
            context.moveTo(
              x,
              y
            );
          } else {
            context.lineTo(
              x,
              y
            );
          }
        }
      );

      context.stroke();

      /* LEGEND */

      const legendX =
        48 +
        seriesIndex *
          220;

      context.fillStyle =
        item.color;

      context.fillRect(
        legendX,
        102,
        24,
        8
      );

      context.fillStyle =
        CHART.white;

      context.font =
        "18px Arial";

      context.textAlign =
        "left";

      context.fillText(
        item.name,
        legendX + 34,
        111
      );
    }
  );

  return canvas.toDataURL(
    "image/png"
  );
}

/* =========================================================
   GROUPED BAR CHART
========================================================= */

function createComparisonChart(
  labels: string[],
  currentValues: number[],
  previousValues: number[]
) {
  const width =
    1200;

  const height =
    560;

  const {
    canvas,
    context,
  } =
    createCanvas(
      width,
      height
    );

  drawChartHeading(
    context,
    "Current vs Previous",
    "Period-over-period comparison"
  );

  const plotLeft =
    90;

  const plotTop =
    145;

  const plotWidth =
    1050;

  const plotHeight =
    330;

  const maxValue =
    Math.max(
      ...currentValues,
      ...previousValues,
      1
    );

  const roundedMaximum =
    maxValue <= 5
      ? 5
      : Math.ceil(
          maxValue /
            5
        ) * 5;

  for (
    let line = 0;
    line <= 5;
    line += 1
  ) {
    const y =
      plotTop +
      (plotHeight /
        5) *
        line;

    context.strokeStyle =
      CHART.grid;

    context.lineWidth =
      1;

    context.beginPath();

    context.moveTo(
      plotLeft,
      y
    );

    context.lineTo(
      plotLeft +
        plotWidth,
      y
    );

    context.stroke();

    context.fillStyle =
      CHART.muted;

    context.font =
      "18px Arial";

    context.textAlign =
      "right";

    context.fillText(
      formatCompact(
        roundedMaximum -
          (roundedMaximum /
            5) *
            line
      ),
      plotLeft - 16,
      y + 6
    );
  }

  const groupWidth =
    plotWidth /
    Math.max(
      labels.length,
      1
    );

  const barWidth =
    Math.min(
      55,
      groupWidth *
        0.26
    );

  labels.forEach(
    (
      label,
      index
    ) => {
      const center =
        plotLeft +
        groupWidth *
          index +
        groupWidth /
          2;

      const currentHeight =
        (currentValues[
          index
        ] /
          roundedMaximum) *
        plotHeight;

      const previousHeight =
        (previousValues[
          index
        ] /
          roundedMaximum) *
        plotHeight;

      context.fillStyle =
        CHART.orange;

      context.fillRect(
        center -
          barWidth -
          5,
        plotTop +
          plotHeight -
          currentHeight,
        barWidth,
        currentHeight
      );

      context.fillStyle =
        CHART.blue;

      context.fillRect(
        center + 5,
        plotTop +
          plotHeight -
          previousHeight,
        barWidth,
        previousHeight
      );

      context.fillStyle =
        CHART.muted;

      context.font =
        "16px Arial";

      context.textAlign =
        "center";

      context.fillText(
        label,
        center,
        plotTop +
          plotHeight +
          35
      );
    }
  );

  context.fillStyle =
    CHART.orange;

  context.fillRect(
    48,
    103,
    24,
    8
  );

  context.fillStyle =
    CHART.white;

  context.font =
    "18px Arial";

  context.textAlign =
    "left";

  context.fillText(
    "Current",
    82,
    112
  );

  context.fillStyle =
    CHART.blue;

  context.fillRect(
    200,
    103,
    24,
    8
  );

  context.fillStyle =
    CHART.white;

  context.fillText(
    "Previous",
    234,
    112
  );

  return canvas.toDataURL(
    "image/png"
  );
}

/* =========================================================
   HORIZONTAL BAR CHART
========================================================= */

function createHorizontalBarChart(
  title: string,
  subtitle: string,
  labels: string[],
  values: number[],
  color: string
) {
  const width =
    1200;

  const height =
    560;

  const {
    canvas,
    context,
  } =
    createCanvas(
      width,
      height
    );

  drawChartHeading(
    context,
    title,
    subtitle
  );

  const chartLabels =
    labels.slice(
      0,
      8
    );

  const chartValues =
    values.slice(
      0,
      8
    );

  if (
    chartLabels.length ===
    0
  ) {
    context.fillStyle =
      CHART.muted;

    context.font =
      "24px Arial";

    context.fillText(
      "No analytics data available yet.",
      48,
      180
    );

    return canvas.toDataURL(
      "image/png"
    );
  }

  const maximum =
    Math.max(
      ...chartValues,
      1
    );

  const startX =
    340;

  const barWidth =
    760;

  const startY =
    135;

  const rowHeight =
    48;

  chartLabels.forEach(
    (
      label,
      index
    ) => {
      const y =
        startY +
        index *
          rowHeight;

      context.fillStyle =
        CHART.white;

      context.font =
        "18px Arial";

      context.textAlign =
        "right";

      const displayLabel =
        label.length >
        28
          ? `${label.slice(
              0,
              26
            )}…`
          : label;

      context.fillText(
        displayLabel,
        startX - 22,
        y + 22
      );

      context.fillStyle =
        CHART.plot;

      context.fillRect(
        startX,
        y,
        barWidth,
        28
      );

      const widthValue =
        (chartValues[
          index
        ] /
          maximum) *
        barWidth;

      context.fillStyle =
        color;

      context.fillRect(
        startX,
        y,
        widthValue,
        28
      );

      context.fillStyle =
        CHART.white;

      context.font =
        "bold 17px Arial";

      context.textAlign =
        "left";

      context.fillText(
        formatCompact(
          chartValues[
            index
          ]
        ),
        Math.min(
          startX +
            widthValue +
            12,
          width - 70
        ),
        y + 21
      );
    }
  );

  return canvas.toDataURL(
    "image/png"
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ExcelDashboardExport() {
const [
  days,
  setDays,
] =
  useAnalyticsRange(
    30
  );

  const [
    exporting,
    setExporting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  /* =====================================================
     EXPORT
  ===================================================== */

  async function exportExcelDashboard() {
    try {
      setExporting(
        true
      );

      setError(
        ""
      );

      /* =================================================
         LOAD EXCELJS ONLY WHEN USER CLICKS EXPORT
      ================================================= */

      const ExcelJS =
        await import(
          "exceljs"
        );

      /* =================================================
         FETCH CURRENT ANALYTICS
      ================================================= */

      const [
        overviewResponse,
        categoryResponse,
        trendingResponse,
      ] =
        await Promise.all([
          fetch(
            `/api/admin/analytics?days=${days}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          ),

          fetch(
            `/api/admin/analytics/categories?days=${days}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          ),

          fetch(
            `/api/admin/analytics/trending?days=${days}`,
            {
              method:
                "GET",

              cache:
                "no-store",
            }
          ),
        ]);

      if (
        !overviewResponse.ok
      ) {
        throw new Error(
          "Unable to load platform analytics."
        );
      }

      if (
        !categoryResponse.ok
      ) {
        throw new Error(
          "Unable to load category analytics."
        );
      }

      if (
        !trendingResponse.ok
      ) {
        throw new Error(
          "Unable to load trending analytics."
        );
      }

      const overview =
        (await overviewResponse.json()) as
          OverviewAnalytics;

      const categories =
        (await categoryResponse.json()) as
          CategoryAnalytics;

      const trending =
        (await trendingResponse.json()) as
          TrendingAnalytics;

      /* =================================================
         SAFE DATA
      ================================================= */

      const overviewSummary =
        overview.summary ??
        overview.totals ??
        {};

      const comparison =
        overview.comparison;

      const traffic =
        overview.traffic ??
        [];

      const categoryItems =
        categories.categories ??
        [];

      const trendingContent =
        trending.trendingContent ??
        [];

      const trendingCategories =
        trending.trendingCategories ??
        [];

      const topArticles =
        overview.topArticles ??
        [];

      const topBooks =
        overview.topBooks ??
        [];

      const topDownloads =
        overview.topDownloadedBooks ??
        [];

      const topSaved =
        overview.topSaved ??
        [];

      const periodViews =
        comparison?.views
          ?.current ??
        overviewSummary.views ??
        trending.summary.views ??
        0;

      const periodDownloads =
        comparison?.downloads
          ?.current ??
        overviewSummary.downloads ??
        trending.summary
          .downloads ??
        0;

      const uniqueVisitors =
        comparison
          ?.uniqueVisitors
          ?.current ??
        overviewSummary
          .uniqueVisitors ??
        0;

      const newUsers =
        comparison?.newUsers
          ?.current ??
        overviewSummary.newUsers ??
        0;

      const users =
        numberValue(
          overviewSummary.users
        );

      const publishedContent =
        categories.summary
          .totalContent;

      /* =================================================
         CREATE WORKBOOK
      ================================================= */

      const workbook =
        new ExcelJS.Workbook();

      workbook.creator =
        "PetroHub";

      workbook.company =
        "PetroHub";

      workbook.title =
        `PetroHub Analytics Dashboard - ${days} Days`;

      workbook.subject =
        "PetroHub Analytics Dashboard";

      workbook.description =
        "PetroHub management analytics dashboard with traffic, categories, downloads and trending content.";

      workbook.created =
        new Date();

      workbook.modified =
        new Date();

      /* =================================================
         DASHBOARD SHEET
      ================================================= */

      const dashboard =
        workbook.addWorksheet(
          "Dashboard",
          {
            views: [
              {
                showGridLines:
                  false,
              },
            ],
          }
        );

      dashboard.properties.tabColor =
        {
          argb:
            EXCEL.orange,
        };

      dashboard.pageSetup.orientation =
        "landscape";

      dashboard.pageSetup.fitToPage =
        true;

      dashboard.pageSetup.fitToWidth =
        1;

      dashboard.pageSetup.fitToHeight =
        0;

      for (
        let column = 1;
        column <= 14;
        column += 1
      ) {
        dashboard.getColumn(
          column
        ).width = 12;
      }

      fillDashboardArea(
        dashboard,
        1,
        70,
        1,
        14
      );

      /* TITLE */

      dashboard.mergeCells(
        "A1:N2"
      );

      const dashboardTitle =
        dashboard.getCell(
          "A1"
        );

      dashboardTitle.value =
        "PETROHUB ANALYTICS DASHBOARD";

      dashboardTitle.font = {
        bold: true,

        size: 24,

        color: {
          argb:
            EXCEL.white,
        },
      };

      dashboardTitle.alignment =
        {
          vertical:
            "middle",

          horizontal:
            "left",
        };

      dashboardTitle.fill = {
        type:
          "pattern",

        pattern:
          "solid",

        fgColor: {
          argb:
            EXCEL.background,
        },
      };

      dashboard.getRow(
        1
      ).height = 30;

      dashboard.getRow(
        2
      ).height = 22;

      dashboard.mergeCells(
        "A3:N3"
      );

      const subtitle =
        dashboard.getCell(
          "A3"
        );

      subtitle.value =
        `${days}-Day Management Report | ${cleanDate(
          categories.range
            .startDate
        )} to ${cleanDate(
          categories.range
            .endDate
        )} | Generated ${new Date().toLocaleString(
          "en-IN"
        )}`;

      subtitle.font = {
        size: 10,

        color: {
          argb:
            EXCEL.muted,
        },
      };

      /* =================================================
         KPI CARDS ROW 1
      ================================================= */

      addKpiCard(
        dashboard,
        1,
        3,
        5,
        "TOTAL USERS",
        formatNumber(
          users
        ),
        `${formatNumber(
          newUsers
        )} new users in selected period`,
        EXCEL.blue
      );

      addKpiCard(
        dashboard,
        4,
        6,
        5,
        "PERIOD VIEWS",
        formatNumber(
          periodViews
        ),
        `${days}-day tracked views`,
        EXCEL.orange
      );

      addKpiCard(
        dashboard,
        7,
        9,
        5,
        "UNIQUE VISITORS",
        formatNumber(
          uniqueVisitors
        ),
        "Unique tracked visitors",
        EXCEL.cyan
      );

      addKpiCard(
        dashboard,
        10,
        12,
        5,
        "DOWNLOADS",
        formatNumber(
          periodDownloads
        ),
        `${days}-day tracked downloads`,
        EXCEL.purple
      );

      addKpiCard(
        dashboard,
        13,
        14,
        5,
        "CONTENT",
        formatNumber(
          publishedContent
        ),
        "Published items",
        EXCEL.green
      );

      /* =================================================
         CHART DATA
      ================================================= */

      const trafficLabels =
        traffic.map(
          (
            item
          ) =>
            shortDate(
              item.date
            )
        );

      const trafficChart =
        createLineChart(
          "Daily Traffic Trend",
          `${days}-day tracked activity`,
          trafficLabels,
          [
            {
              name:
                "Views",

              values:
                traffic.map(
                  (
                    item
                  ) =>
                    item.views
                ),

              color:
                CHART.orange,
            },

            {
              name:
                "Downloads",

              values:
                traffic.map(
                  (
                    item
                  ) =>
                    item.downloads
                ),

              color:
                CHART.purple,
            },
          ]
        );

      const comparisonLabels =
        [
          "Views",
          "Visitors",
          "Downloads",
          "Article",
          "Library",
        ];

      const comparisonCurrent =
        [
          comparison?.views
            ?.current ??
            0,

          comparison
            ?.uniqueVisitors
            ?.current ??
            0,

          comparison?.downloads
            ?.current ??
            0,

          comparison
            ?.articleViews
            ?.current ??
            0,

          comparison?.bookViews
            ?.current ??
            0,
        ];

      const comparisonPrevious =
        [
          comparison?.views
            ?.previous ??
            0,

          comparison
            ?.uniqueVisitors
            ?.previous ??
            0,

          comparison?.downloads
            ?.previous ??
            0,

          comparison
            ?.articleViews
            ?.previous ??
            0,

          comparison?.bookViews
            ?.previous ??
            0,
        ];

      const comparisonChart =
        createComparisonChart(
          comparisonLabels,
          comparisonCurrent,
          comparisonPrevious
        );

      const categoryChart =
        createHorizontalBarChart(
          "Category Performance",
          "Top categories by engagement score",
          categoryItems
            .slice(
              0,
              8
            )
            .map(
              (
                item
              ) =>
                item.category
            ),
          categoryItems
            .slice(
              0,
              8
            )
            .map(
              (
                item
              ) =>
                item.score
            ),
          CHART.cyan
        );

      const trendingChart =
        createHorizontalBarChart(
          "Trending Content",
          "Top content by momentum score",
          trendingContent
            .slice(
              0,
              8
            )
            .map(
              (
                item
              ) =>
                item.title
            ),
          trendingContent
            .slice(
              0,
              8
            )
            .map(
              (
                item
              ) =>
                item.momentumScore
            ),
          CHART.pink
        );

      /* =================================================
         EMBED CHARTS
      ================================================= */

      const trafficImageId =
        workbook.addImage({
          base64:
            trafficChart,

          extension:
            "png",
        });

      const comparisonImageId =
        workbook.addImage({
          base64:
            comparisonChart,

          extension:
            "png",
        });

      const categoryImageId =
        workbook.addImage({
          base64:
            categoryChart,

          extension:
            "png",
        });

      const trendingImageId =
        workbook.addImage({
          base64:
            trendingChart,

          extension:
            "png",
        });

      dashboard.addImage(
        trafficImageId,
        {
          tl: {
            col: 0,
            row: 10,
          },

          ext: {
            width:
              620,

            height:
              300,
          },
        }
      );

      dashboard.addImage(
        comparisonImageId,
        {
          tl: {
            col: 7,
            row: 10,
          },

          ext: {
            width:
              620,

            height:
              300,
          },
        }
      );

      dashboard.addImage(
        categoryImageId,
        {
          tl: {
            col: 0,
            row: 28,
          },

          ext: {
            width:
              620,

            height:
              300,
          },
        }
      );

      dashboard.addImage(
        trendingImageId,
        {
          tl: {
            col: 7,
            row: 28,
          },

          ext: {
            width:
              620,

            height:
              300,
          },
        }
      );

      /* =================================================
         DASHBOARD TRENDING TABLE
      ================================================= */

      dashboard.mergeCells(
        "A47:N47"
      );

      const dashboardTableTitle =
        dashboard.getCell(
          "A47"
        );

      dashboardTableTitle.value =
        "TOP TRENDING CONTENT";

      dashboardTableTitle.font =
        {
          bold: true,

          size: 13,

          color: {
            argb:
              EXCEL.pink,
          },
        };

      dashboardTableTitle.fill =
        {
          type:
            "pattern",

          pattern:
            "solid",

          fgColor: {
            argb:
              EXCEL.panel,
          },
        };

      const dashboardHeaders =
        [
          "Rank",
          "Content",
          "Type",
          "Category",
          "Views",
          "Previous",
          "Downloads",
          "Growth",
          "Trend",
          "Momentum",
        ];

      const dashboardHeaderColumns =
        [
          1,
          2,
          6,
          7,
          9,
          10,
          11,
          12,
          13,
          14,
        ];

      dashboardHeaders.forEach(
        (
          header,
          index
        ) => {
          const cell =
            dashboard.getCell(
              48,
              dashboardHeaderColumns[
                index
              ]
            );

          cell.value =
            header;

          styleHeaderCell(
            cell
          );
        }
      );

      dashboard.mergeCells(
        "B48:E48"
      );

      dashboard.mergeCells(
        "G48:H48"
      );

      trendingContent
        .slice(
          0,
          8
        )
        .forEach(
          (
            item,
            index
          ) => {
            const row =
              49 +
              index;

            dashboard.getCell(
              row,
              1
            ).value =
              item.rank;

            dashboard.mergeCells(
              row,
              2,
              row,
              5
            );

            dashboard.getCell(
              row,
              2
            ).value =
              item.title;

            dashboard.getCell(
              row,
              6
            ).value =
              item.itemType ===
              "article"
                ? "Article"
                : "Library";

            dashboard.mergeCells(
              row,
              7,
              row,
              8
            );

            dashboard.getCell(
              row,
              7
            ).value =
              item.category;

            dashboard.getCell(
              row,
              9
            ).value =
              item.views;

            dashboard.getCell(
              row,
              10
            ).value =
              item.previousViews;

            dashboard.getCell(
              row,
              11
            ).value =
              item.downloads;

            dashboard.getCell(
              row,
              12
            ).value =
              growthText(
                item.growthPercent
              );

            dashboard.getCell(
              row,
              13
            ).value =
              trendText(
                item.trend
              );

            dashboard.getCell(
              row,
              14
            ).value =
              item.momentumScore;

            for (
              let column =
                1;
              column <= 14;
              column += 1
            ) {
              styleDataCell(
                dashboard.getCell(
                  row,
                  column
                ),
                row
              );
            }

            dashboard.getCell(
              row,
              12
            ).font = {
              bold: true,

              color: {
                argb:
                  item.trend ===
                    "down"
                    ? EXCEL.red
                    : item.trend ===
                        "up"
                      ? EXCEL.green
                      : item.trend ===
                          "new"
                        ? EXCEL.blue
                        : EXCEL.muted,
              },
            };
          }
        );

      /* =================================================
         DAILY ANALYTICS SHEET
      ================================================= */

      const dailySheet =
        workbook.addWorksheet(
          "Daily Analytics"
        );

      dailySheet.properties.tabColor =
        {
          argb:
            EXCEL.orange,
        };

      prepareDataSheet(
        dailySheet,
        "Daily Analytics",
        `${days}-day traffic, downloads and new-user activity`,
        6
      );

      dailySheet.getRow(
        4
      ).values = [
        "Date",
        "Views",
        "Article Views",
        "Library Views",
        "Downloads",
        "New Users",
      ];

      traffic.forEach(
        (
          item
        ) => {
          dailySheet.addRow([
            cleanDate(
              item.date
            ),

            item.views,

            item.articleViews,

            item.bookViews,

            item.downloads,

            item.newUsers,
          ]);
        }
      );

      const dailyLastRow =
        Math.max(
          4,
          dailySheet.rowCount
        );

      styleTable(
        dailySheet,
        4,
        dailyLastRow,
        6
      );

      dailySheet.getColumn(
        1
      ).width = 16;

      for (
        let column = 2;
        column <= 6;
        column += 1
      ) {
        dailySheet.getColumn(
          column
        ).width = 18;

        dailySheet.getColumn(
          column
        ).numFmt =
          "#,##0";
      }

      /* =================================================
         CATEGORY SHEET
      ================================================= */

      const categorySheet =
        workbook.addWorksheet(
          "Categories"
        );

      categorySheet.properties.tabColor =
        {
          argb:
            EXCEL.cyan,
        };

      prepareDataSheet(
        categorySheet,
        "Category Analytics",
        `Published content and ${days}-day engagement by engineering category`,
        11
      );

      categorySheet.getRow(
        4
      ).values = [
        "Rank",
        "Category",
        "Articles",
        "Resources",
        "Total Content",
        "Views",
        "Article Views",
        "Library Views",
        "Downloads",
        "New Saves",
        "Engagement Score",
      ];

      categoryItems.forEach(
        (
          item,
          index
        ) => {
          categorySheet.addRow([
            index + 1,

            item.category,

            item.articles,

            item.resources,

            item.totalContent,

            item.views,

            item.articleViews,

            item.bookViews,

            item.downloads,

            item.bookmarks,

            item.score,
          ]);
        }
      );

      const categoryLastRow =
        Math.max(
          4,
          categorySheet.rowCount
        );

      styleTable(
        categorySheet,
        4,
        categoryLastRow,
        11
      );

      categorySheet.getColumn(
        1
      ).width = 10;

      categorySheet.getColumn(
        2
      ).width = 28;

      for (
        let column = 3;
        column <= 11;
        column += 1
      ) {
        categorySheet.getColumn(
          column
        ).width = 17;

        categorySheet.getColumn(
          column
        ).numFmt =
          "#,##0";
      }

      /* =================================================
         TRENDING CONTENT SHEET
      ================================================= */

      const trendingSheet =
        workbook.addWorksheet(
          "Trending Content"
        );

      trendingSheet.properties.tabColor =
        {
          argb:
            EXCEL.pink,
        };

      prepareDataSheet(
        trendingSheet,
        "Trending Content",
        `Current ${days}-day period compared with the immediately preceding equal period`,
        14
      );

      trendingSheet.getRow(
        4
      ).values = [
        "Rank",
        "Title",
        "Type",
        "Category",
        "Current Views",
        "Previous Views",
        "Current Downloads",
        "Previous Downloads",
        "Current Engagement",
        "Previous Engagement",
        "Growth",
        "Trend",
        "Momentum Score",
        "Slug",
      ];

      trendingContent.forEach(
        (
          item
        ) => {
          trendingSheet.addRow([
            item.rank,

            item.title,

            item.itemType ===
            "article"
              ? "Article"
              : "Library",

            item.category,

            item.views,

            item.previousViews,

            item.downloads,

            item.previousDownloads,

            item.currentEngagement,

            item.previousEngagement,

            growthText(
              item.growthPercent
            ),

            trendText(
              item.trend
            ),

            item.momentumScore,

            item.slug,
          ]);
        }
      );

      const trendingLastRow =
        Math.max(
          4,
          trendingSheet.rowCount
        );

      styleTable(
        trendingSheet,
        4,
        trendingLastRow,
        14
      );

      trendingSheet.getColumn(
        1
      ).width = 9;

      trendingSheet.getColumn(
        2
      ).width = 42;

      trendingSheet.getColumn(
        3
      ).width = 14;

      trendingSheet.getColumn(
        4
      ).width = 25;

      for (
        let column = 5;
        column <= 10;
        column += 1
      ) {
        trendingSheet.getColumn(
          column
        ).width = 18;

        trendingSheet.getColumn(
          column
        ).numFmt =
          "#,##0";
      }

      trendingSheet.getColumn(
        11
      ).width = 14;

      trendingSheet.getColumn(
        12
      ).width = 18;

      trendingSheet.getColumn(
        13
      ).width = 18;

      trendingSheet.getColumn(
        14
      ).width = 42;

      /* TREND COLOUR */

      for (
        let row = 5;
        row <=
        trendingLastRow;
        row += 1
      ) {
        const trendCell =
          trendingSheet.getCell(
            row,
            12
          );

        const trend =
          String(
            trendCell.value ??
              ""
          );

        if (
          trend ===
          "Growing"
        ) {
          trendCell.font = {
            bold: true,

            color: {
              argb:
                EXCEL.green,
            },
          };
        } else if (
          trend ===
          "Declining"
        ) {
          trendCell.font = {
            bold: true,

            color: {
              argb:
                EXCEL.red,
            },
          };
        } else if (
          trend ===
          "New Activity"
        ) {
          trendCell.font = {
            bold: true,

            color: {
              argb:
                EXCEL.blue,
            },
          };
        }
      }

      /* =================================================
         TRENDING CATEGORY SHEET
      ================================================= */

      const trendingCategorySheet =
        workbook.addWorksheet(
          "Trending Categories"
        );

      trendingCategorySheet.properties.tabColor =
        {
          argb:
            EXCEL.purple,
        };

      prepareDataSheet(
        trendingCategorySheet,
        "Trending Categories",
        "Engineering category momentum and period-over-period growth",
        12
      );

      trendingCategorySheet.getRow(
        4
      ).values = [
        "Rank",
        "Category",
        "Active Content",
        "Current Views",
        "Previous Views",
        "Current Downloads",
        "Previous Downloads",
        "Current Engagement",
        "Previous Engagement",
        "Growth",
        "Trend",
        "Momentum Score",
      ];

      trendingCategories.forEach(
        (
          item
        ) => {
          trendingCategorySheet.addRow([
            item.rank,

            item.category,

            item.activeContent,

            item.views,

            item.previousViews,

            item.downloads,

            item.previousDownloads,

            item.currentEngagement,

            item.previousEngagement,

            growthText(
              item.growthPercent
            ),

            trendText(
              item.trend
            ),

            item.momentumScore,
          ]);
        }
      );

      const trendingCategoryLastRow =
        Math.max(
          4,
          trendingCategorySheet.rowCount
        );

      styleTable(
        trendingCategorySheet,
        4,
        trendingCategoryLastRow,
        12
      );

      trendingCategorySheet.getColumn(
        1
      ).width = 9;

      trendingCategorySheet.getColumn(
        2
      ).width = 30;

      for (
        let column = 3;
        column <= 9;
        column += 1
      ) {
        trendingCategorySheet.getColumn(
          column
        ).width = 18;
      }

      trendingCategorySheet.getColumn(
        10
      ).width = 14;

      trendingCategorySheet.getColumn(
        11
      ).width = 18;

      trendingCategorySheet.getColumn(
        12
      ).width = 18;

      /* =================================================
         TOP CONTENT SHEET
      ================================================= */

      const topContentSheet =
        workbook.addWorksheet(
          "Top Content"
        );

      topContentSheet.properties.tabColor =
        {
          argb:
            EXCEL.green,
        };

      prepareDataSheet(
        topContentSheet,
        "Top Content",
        "Top performing articles, library resources, downloads and saved content",
        6
      );

      /* TOP ARTICLES */

      topContentSheet.getRow(
        4
      ).values = [
        "Rank",
        "Top Articles",
        "Category",
        "Views",
        "Slug",
        "",
      ];

      topArticles.forEach(
        (
          item,
          index
        ) => {
          topContentSheet.addRow([
            index + 1,

            item.title,

            item.category ??
              "",

            item.views ??
              0,

            item.slug,

            "",
          ]);
        }
      );

      let currentRow =
        topContentSheet.rowCount +
        2;

      /* TOP BOOKS */

      topContentSheet.getRow(
        currentRow
      ).values = [
        "Rank",
        "Top Library Resources",
        "Category",
        "Views",
        "Slug",
        "",
      ];

      const topBooksHeader =
        currentRow;

      currentRow +=
        1;

      topBooks.forEach(
        (
          item,
          index
        ) => {
          topContentSheet.getRow(
            currentRow
          ).values = [
            index + 1,

            item.title,

            item.category ??
              "",

            item.views ??
              0,

            item.slug,

            "",
          ];

          currentRow +=
            1;
        }
      );

      currentRow +=
        1;

      /* DOWNLOADS */

      topContentSheet.getRow(
        currentRow
      ).values = [
        "Rank",
        "Top Downloads",
        "Category",
        "Downloads",
        "Slug",
        "",
      ];

      const downloadsHeader =
        currentRow;

      currentRow +=
        1;

      topDownloads.forEach(
        (
          item,
          index
        ) => {
          topContentSheet.getRow(
            currentRow
          ).values = [
            index + 1,

            item.title,

            item.category ??
              "",

            item.downloads ??
              0,

            item.slug,

            "",
          ];

          currentRow +=
            1;
        }
      );

      currentRow +=
        1;

      /* SAVED */

      topContentSheet.getRow(
        currentRow
      ).values = [
        "Rank",
        "Most Saved",
        "Type",
        "Category",
        "Saves",
        "Slug",
      ];

      const savedHeader =
        currentRow;

      currentRow +=
        1;

      topSaved.forEach(
        (
          item,
          index
        ) => {
          topContentSheet.getRow(
            currentRow
          ).values = [
            index + 1,

            item.title,

            item.itemType ===
            "article"
              ? "Article"
              : "Library",

            item.category ??
              "",

            item.saves,

            item.slug,
          ];

          currentRow +=
            1;
        }
      );

      /* STYLE TOP CONTENT SECTIONS */

      const articleEnd =
        4 +
        topArticles.length;

      styleTable(
        topContentSheet,
        4,
        Math.max(
          4,
          articleEnd
        ),
        6
      );

      styleTable(
        topContentSheet,
        topBooksHeader,
        Math.max(
          topBooksHeader,
          topBooksHeader +
            topBooks.length
        ),
        6
      );

      styleTable(
        topContentSheet,
        downloadsHeader,
        Math.max(
          downloadsHeader,
          downloadsHeader +
            topDownloads.length
        ),
        6
      );

      styleTable(
        topContentSheet,
        savedHeader,
        Math.max(
          savedHeader,
          savedHeader +
            topSaved.length
        ),
        6
      );

      topContentSheet.getColumn(
        1
      ).width = 10;

      topContentSheet.getColumn(
        2
      ).width = 44;

      topContentSheet.getColumn(
        3
      ).width = 25;

      topContentSheet.getColumn(
        4
      ).width = 18;

      topContentSheet.getColumn(
        5
      ).width = 42;

      topContentSheet.getColumn(
        6
      ).width = 16;

      /* =================================================
         README SHEET
      ================================================= */

      const information =
        workbook.addWorksheet(
          "Report Info"
        );

      information.properties.tabColor =
        {
          argb:
            EXCEL.blue,
        };

      prepareDataSheet(
        information,
        "PetroHub Analytics Report Information",
        "Definitions and calculation notes used in this workbook",
        3
      );

      information.getRow(
        4
      ).values = [
        "Item",
        "Definition",
        "Notes",
      ];

      const infoRows = [
        [
          "Reporting Period",
          `${days} days`,
          `${cleanDate(
            categories.range
              .startDate
          )} to ${cleanDate(
            categories.range
              .endDate
          )}`,
        ],

        [
          "Views",
          "Tracked analytics view events",
          "Historical event analytics begins from the date analytics event tracking was enabled.",
        ],

        [
          "Downloads",
          "Tracked resource download events",
          "Download duplicate suppression rules continue to apply.",
        ],

        [
          "Category Engagement Score",
          "Views × 1 + Downloads × 3 + Saves × 2",
          "Used for category ranking.",
        ],

        [
          "Trending Engagement",
          "Views × 1 + Downloads × 3",
          "Compared against the immediately preceding equal calendar period.",
        ],

        [
          "Momentum Score",
          "Recent engagement adjusted using previous-period performance",
          "New activity is handled without displaying infinite growth percentages.",
        ],

        [
          "Charts",
          "Dashboard visualisations",
          "Charts are embedded as high-resolution Excel dashboard graphics.",
        ],

        [
          "Generated At",
          new Date().toISOString(),
          "Generated from the live PetroHub analytics APIs.",
        ],
      ];

      infoRows.forEach(
        (
          row
        ) => {
          information.addRow(
            row
          );
        }
      );

      styleTable(
        information,
        4,
        information.rowCount,
        3
      );

      information.getColumn(
        1
      ).width = 28;

      information.getColumn(
        2
      ).width = 55;

      information.getColumn(
        3
      ).width = 75;

      information.getColumn(
        3
      ).alignment = {
        wrapText: true,

        vertical:
          "top",
      };

      /* =================================================
         EXPORT XLSX
      ================================================= */

      const buffer =
        await workbook.xlsx.writeBuffer();

      const blob =
        new Blob(
          [
            buffer as unknown as
              ArrayBuffer,
          ],
          {
            type:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }
        );

      const objectUrl =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      const today =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          );

      anchor.href =
        objectUrl;

      anchor.download =
        `petrohub-analytics-dashboard-${days}-days-${today}.xlsx`;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        objectUrl
      );
    } catch (
      exportError
    ) {
      console.error(
        "Excel dashboard export error:",
        exportError
      );

      setError(
        exportError instanceof
          Error
          ? exportError.message
          : "Unable to generate Excel dashboard."
      );
    } finally {
      setExporting(
        false
      );
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-900">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* LEFT */}

          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-2xl">
              📊
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                Excel Dashboard
              </p>

              <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                Export Professional
                Excel Report
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Generate a complete
                management-style
                Excel workbook with
                KPI cards, traffic
                graphs, period
                comparisons,
                category charts,
                trending charts and
                detailed analytics
                sheets.
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-xl border border-slate-700 bg-slate-950 p-1">
              {(
                [
                  7,
                  30,
                  90,
                ] as RangeDays[]
              ).map(
                (
                  value
                ) => (
                  <button
                    key={
                      value
                    }
                    type="button"
                    disabled={
                      exporting
                    }
                    onClick={() =>
                      setDays(
                        value
                      )
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      days ===
                      value
                        ? "bg-cyan-500 text-slate-950"
                        : "text-slate-400 hover:text-white"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {value} Days
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              disabled={
                exporting
              }
              onClick={
                exportExcelDashboard
              }
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  exporting
                    ? "animate-spin"
                    : ""
                }
              >
                {exporting
                  ? "↻"
                  : "📊"}
              </span>

              {exporting
                ? "Building Dashboard..."
                : "Export Excel Dashboard"}
            </button>
          </div>
        </div>

        {/* FEATURES */}

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "KPI Dashboard",
            "Daily Traffic Graph",
            "Period Comparison",
            "Category Chart",
            "Trending Chart",
            "Daily Analytics",
            "Category Data",
            "Trending Content",
            "Top Content",
            "Report Notes",
          ].map(
            (
              feature
            ) => (
              <span
                key={
                  feature
                }
                className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[11px] font-semibold text-slate-400"
              >
                ✓ {feature}
              </span>
            )
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-bold text-red-400">
              Excel export failed
            </p>

            <p className="mt-1 text-xs leading-5 text-red-300">
              {error}
            </p>
          </div>
        )}

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs leading-5 text-slate-500">
            <strong className="text-slate-300">
              Workbook sheets:
            </strong>{" "}
            Dashboard • Daily
            Analytics • Categories •
            Trending Content •
            Trending Categories • Top
            Content • Report Info.
          </p>
        </div>
      </div>
    </section>
  );
}