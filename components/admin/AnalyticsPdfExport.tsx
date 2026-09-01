"use client";

import { useState } from "react";
import {
  useAnalyticsRange,
} from "@/lib/useAnalyticsRange";

/* =========================================================
   TYPES
========================================================= */

type RangeDays = 7 | 30 | 90;

type TrendStatus =
  | "up"
  | "down"
  | "same"
  | "new";

type PdfColor = [
  number,
  number,
  number,
];

type ComparisonMetric = {
  current: number;
  previous: number;
  changePercent: number | null;
  trend: TrendStatus;
};

type TrafficItem = {
  date: string;

  views: number;

  articleViews: number;

  bookViews: number;

  downloads: number;

  newUsers: number;
};

/* =========================================================
   OVERVIEW TYPES
========================================================= */

type OverviewSummary = {
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

type OverviewAnalytics = {
  success: boolean;

  summary?: OverviewSummary;

  totals?: OverviewSummary;

  comparison?: {
    views?: ComparisonMetric;

    uniqueVisitors?: ComparisonMetric;

    downloads?: ComparisonMetric;

    uniqueDownloaders?: ComparisonMetric;

    articleViews?: ComparisonMetric;

    bookViews?: ComparisonMetric;

    newUsers?: ComparisonMetric;
  };

  traffic?: TrafficItem[];
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

  categories: CategoryItem[];
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

  trend: TrendStatus;

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

  trend: TrendStatus;

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

  trendingContent: TrendingContentItem[];

  trendingCategories: TrendingCategoryItem[];
};

/* =========================================================
   NUMBER HELPERS
========================================================= */

function formatNumber(
  value?: number
) {
  return Number(
    value ?? 0
  ).toLocaleString(
    "en-IN"
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

function displayDate(
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

function growthText(
  value:
    | number
    | null
    | undefined
) {
  if (
    value === undefined
  ) {
    return "N/A";
  }

  if (
    value === null
  ) {
    return "New";
  }

  if (
    value > 0
  ) {
    return `+${value}%`;
  }

  return `${value}%`;
}

function trendText(
  trend?: TrendStatus
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

  if (
    trend === "same"
  ) {
    return "No Change";
  }

  return "N/A";
}

/* =========================================================
   TRAFFIC CHART
========================================================= */

function createTrafficChart(
  traffic: TrafficItem[]
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    1400;

  canvas.height =
    620;

  const canvasContext =
    canvas.getContext(
      "2d"
    );

  if (
    !canvasContext
  ) {
    throw new Error(
      "Unable to create traffic chart."
    );
  }

  /*
    Explicit non-null Canvas context.

    This prevents TypeScript errors
    inside nested draw functions.
  */

  const ctx:
    CanvasRenderingContext2D =
    canvasContext;

  const width =
    canvas.width;

  const height =
    canvas.height;

  /* =====================================================
     BACKGROUND
  ===================================================== */

  ctx.fillStyle =
    "#0f172a";

  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  /* =====================================================
     TITLE
  ===================================================== */

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "bold 36px Arial";

  ctx.textAlign =
    "left";

  ctx.fillText(
    "Daily Traffic Trend",
    55,
    60
  );

  /* =====================================================
     SUBTITLE
  ===================================================== */

  ctx.fillStyle =
    "#94a3b8";

  ctx.font =
    "20px Arial";

  ctx.fillText(
    "Tracked views and downloads",
    55,
    94
  );

  /* =====================================================
     EMPTY DATA
  ===================================================== */

  if (
    traffic.length ===
    0
  ) {
    ctx.fillStyle =
      "#94a3b8";

    ctx.font =
      "22px Arial";

    ctx.fillText(
      "No traffic data available.",
      55,
      180
    );

    return canvas.toDataURL(
      "image/png"
    );
  }

  /* =====================================================
     CHART DIMENSIONS
  ===================================================== */

  const left =
    100;

  const right =
    60;

  const top =
    150;

  const bottom =
    90;

  const plotWidth =
    width -
    left -
    right;

  const plotHeight =
    height -
    top -
    bottom;

  /* =====================================================
     MAXIMUM VALUE
  ===================================================== */

  const maximum =
    Math.max(
      ...traffic.map(
        (
          item
        ) =>
          Math.max(
            item.views,
            item.downloads
          )
      ),
      1
    );

  const yMaximum =
    maximum <=
    5
      ? 5
      : Math.ceil(
          maximum /
            5
        ) *
        5;

  /* =====================================================
     GRID
  ===================================================== */

  for (
    let index = 0;
    index <= 5;
    index += 1
  ) {
    const y =
      top +
      (plotHeight /
        5) *
        index;

    ctx.strokeStyle =
      "#334155";

    ctx.lineWidth =
      1;

    ctx.beginPath();

    ctx.moveTo(
      left,
      y
    );

    ctx.lineTo(
      left +
        plotWidth,
      y
    );

    ctx.stroke();

    const value =
      Math.round(
        yMaximum -
          (yMaximum /
            5) *
            index
      );

    ctx.fillStyle =
      "#94a3b8";

    ctx.font =
      "18px Arial";

    ctx.textAlign =
      "right";

    ctx.fillText(
      value.toLocaleString(
        "en-IN"
      ),
      left -
        18,
      y +
        6
    );
  }

  /* =====================================================
     DRAW SERIES
  ===================================================== */

  function drawSeries(
    values: number[],
    color: string
  ) {
    if (
      values.length ===
      0
    ) {
      return;
    }

    ctx.strokeStyle =
      color;

    ctx.lineWidth =
      5;

    ctx.lineJoin =
      "round";

    ctx.lineCap =
      "round";

    ctx.beginPath();

    values.forEach(
      (
        value,
        index
      ) => {
        const x =
          values.length ===
          1
            ? left
            : left +
              (index /
                (values.length -
                  1)) *
                plotWidth;

        const y =
          top +
          plotHeight -
          (value /
            yMaximum) *
            plotHeight;

        if (
          index ===
          0
        ) {
          ctx.moveTo(
            x,
            y
          );
        } else {
          ctx.lineTo(
            x,
            y
          );
        }
      }
    );

    ctx.stroke();

    /* =================================================
       POINTS
    ================================================= */

    values.forEach(
      (
        value,
        index
      ) => {
        const x =
          values.length ===
          1
            ? left
            : left +
              (index /
                (values.length -
                  1)) *
                plotWidth;

        const y =
          top +
          plotHeight -
          (value /
            yMaximum) *
            plotHeight;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          4,
          0,
          Math.PI *
            2
        );

        ctx.fillStyle =
          color;

        ctx.fill();
      }
    );
  }

  /* =====================================================
     VIEWS SERIES
  ===================================================== */

  drawSeries(
    traffic.map(
      (
        item
      ) =>
        item.views
    ),
    "#f97316"
  );

  /* =====================================================
     DOWNLOAD SERIES
  ===================================================== */

  drawSeries(
    traffic.map(
      (
        item
      ) =>
        item.downloads
    ),
    "#a855f7"
  );

  /* =====================================================
     X LABELS
  ===================================================== */

  const labelStep =
    Math.max(
      1,
      Math.ceil(
        traffic.length /
          7
      )
    );

  traffic.forEach(
    (
      item,
      index
    ) => {
      if (
        index %
          labelStep !==
          0 &&
        index !==
          traffic.length -
            1
      ) {
        return;
      }

      const x =
        traffic.length ===
        1
          ? left
          : left +
            (index /
              (traffic.length -
                1)) *
              plotWidth;

      ctx.fillStyle =
        "#94a3b8";

      ctx.font =
        "16px Arial";

      ctx.textAlign =
        "center";

      ctx.fillText(
        shortDate(
          item.date
        ),
        x,
        top +
          plotHeight +
          42
      );
    }
  );

  /* =====================================================
     LEGEND - VIEWS
  ===================================================== */

  ctx.fillStyle =
    "#f97316";

  ctx.fillRect(
    55,
    112,
    26,
    8
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "18px Arial";

  ctx.textAlign =
    "left";

  ctx.fillText(
    "Views",
    92,
    121
  );

  /* =====================================================
     LEGEND - DOWNLOADS
  ===================================================== */

  ctx.fillStyle =
    "#a855f7";

  ctx.fillRect(
    190,
    112,
    26,
    8
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.fillText(
    "Downloads",
    227,
    121
  );

  return canvas.toDataURL(
    "image/png"
  );
}

/* =========================================================
   CATEGORY CHART
========================================================= */

function createCategoryChart(
  categories: CategoryItem[]
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    1400;

  canvas.height =
    650;

  const canvasContext =
    canvas.getContext(
      "2d"
    );

  if (
    !canvasContext
  ) {
    throw new Error(
      "Unable to create category chart."
    );
  }

  const ctx:
    CanvasRenderingContext2D =
    canvasContext;

  /* =====================================================
     BACKGROUND
  ===================================================== */

  ctx.fillStyle =
    "#0f172a";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /* =====================================================
     TITLE
  ===================================================== */

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "bold 36px Arial";

  ctx.textAlign =
    "left";

  ctx.fillText(
    "Category Performance",
    55,
    60
  );

  /* =====================================================
     SUBTITLE
  ===================================================== */

  ctx.fillStyle =
    "#94a3b8";

  ctx.font =
    "20px Arial";

  ctx.fillText(
    "Top engineering categories by engagement score",
    55,
    94
  );

  /* =====================================================
     DATA
  ===================================================== */

  const topCategories =
    categories.slice(
      0,
      8
    );

  if (
    topCategories.length ===
    0
  ) {
    ctx.fillStyle =
      "#94a3b8";

    ctx.font =
      "22px Arial";

    ctx.fillText(
      "No category data available.",
      55,
      180
    );

    return canvas.toDataURL(
      "image/png"
    );
  }

  const maximum =
    Math.max(
      ...topCategories.map(
        (
          item
        ) =>
          item.score
      ),
      1
    );

  const labelX =
    360;

  const chartWidth =
    900;

  const startY =
    140;

  const rowHeight =
    58;

  /* =====================================================
     BARS
  ===================================================== */

  topCategories.forEach(
    (
      item,
      index
    ) => {
      const y =
        startY +
        index *
          rowHeight;

      const label =
        item.category.length >
        28
          ? `${item.category.slice(
              0,
              26
            )}...`
          : item.category;

      /* LABEL */

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "20px Arial";

      ctx.textAlign =
        "right";

      ctx.fillText(
        label,
        labelX -
          24,
        y +
          25
      );

      /* BAR BACKGROUND */

      ctx.fillStyle =
        "#020617";

      ctx.fillRect(
        labelX,
        y,
        chartWidth,
        32
      );

      /* BAR */

      const barWidth =
        (item.score /
          maximum) *
        chartWidth;

      ctx.fillStyle =
        "#06b6d4";

      ctx.fillRect(
        labelX,
        y,
        barWidth,
        32
      );

      /* VALUE */

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 18px Arial";

      ctx.textAlign =
        "left";

      ctx.fillText(
        item.score.toLocaleString(
          "en-IN"
        ),
        Math.min(
          labelX +
            barWidth +
            14,
          canvas.width -
            90
        ),
        y +
          24
      );
    }
  );

  return canvas.toDataURL(
    "image/png"
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AnalyticsPdfExport() {
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

  async function exportPdf() {
    try {
      setExporting(
        true
      );

      setError(
        ""
      );

      /* =================================================
         LOAD PDF PACKAGES
      ================================================= */

      const [
        jsPDFModule,
        autoTableModule,
      ] =
        await Promise.all([
          import(
            "jspdf"
          ),

          import(
            "jspdf-autotable"
          ),
        ]);

      const {
        jsPDF,
      } =
        jsPDFModule;

      const autoTable =
        autoTableModule.default;

      /* =================================================
         LOAD ANALYTICS
      ================================================= */

      const [
        overviewResponse,
        categoriesResponse,
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

      /* =================================================
         RESPONSE CHECK
      ================================================= */

      if (
        !overviewResponse.ok
      ) {
        throw new Error(
          "Unable to load platform analytics."
        );
      }

      if (
        !categoriesResponse.ok
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

      /* =================================================
         JSON
      ================================================= */

      const overview =
        (await overviewResponse.json()) as
          OverviewAnalytics;

      const categories =
        (await categoriesResponse.json()) as
          CategoryAnalytics;

      const trending =
        (await trendingResponse.json()) as
          TrendingAnalytics;

      /* =================================================
         SAFE VALUES
      ================================================= */

      const summary =
        overview.summary ??
        overview.totals ??
        {};

      const traffic =
        overview.traffic ??
        [];

      const comparison =
        overview.comparison;

      const categoryItems =
        categories.categories ??
        [];

      const trendingContent =
        trending.trendingContent ??
        [];

      /* =================================================
         CREATE PDF
      ================================================= */

      const doc =
        new jsPDF({
          orientation:
            "landscape",

          unit:
            "mm",

          format:
            "a4",
        });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      /* =================================================
         PDF COLORS
      ================================================= */

      const background:
        PdfColor = [
          2,
          6,
          23,
        ];

      const panel:
        PdfColor = [
          15,
          23,
          42,
        ];

      const orange:
        PdfColor = [
          249,
          115,
          22,
        ];

      const cyan:
        PdfColor = [
          6,
          182,
          212,
        ];

      const purple:
        PdfColor = [
          168,
          85,
          247,
        ];

      const green:
        PdfColor = [
          34,
          197,
          94,
        ];

      const muted:
        PdfColor = [
          148,
          163,
          184,
        ];

      const white:
        PdfColor = [
          255,
          255,
          255,
        ];

      /* =================================================
         PDF COLOR HELPERS
      ================================================= */

      function setPdfFillColor(
        color: PdfColor
      ) {
        doc.setFillColor(
          color[0],
          color[1],
          color[2]
        );
      }

      function setPdfTextColor(
        color: PdfColor
      ) {
        doc.setTextColor(
          color[0],
          color[1],
          color[2]
        );
      }

      /* =================================================
         PAGE BACKGROUND
      ================================================= */

      function pageBackground() {
        setPdfFillColor(
          background
        );

        doc.rect(
          0,
          0,
          pageWidth,
          pageHeight,
          "F"
        );
      }

      /* =================================================
         PAGE HEADER
      ================================================= */

      function pageTitle(
        title: string,
        subtitle: string
      ) {
        pageBackground();

        setPdfTextColor(
          orange
        );

        doc.setFontSize(
          9
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          "PETROHUB ANALYTICS",
          14,
          14
        );

        setPdfTextColor(
          white
        );

        doc.setFontSize(
          21
        );

        doc.text(
          title,
          14,
          26
        );

        setPdfTextColor(
          muted
        );

        doc.setFontSize(
          9
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.text(
          subtitle,
          14,
          34
        );
      }

      /* =================================================
         PAGE FOOTER
      ================================================= */

      function footer(
        pageNumber: number
      ) {
        setPdfTextColor(
          muted
        );

        doc.setFontSize(
          7
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.text(
          "PetroHub Management Analytics Report",
          14,
          pageHeight -
            7
        );

        doc.text(
          `Page ${pageNumber}`,
          pageWidth -
            14,
          pageHeight -
            7,
          {
            align:
              "right",
          }
        );
      }

      /* =================================================
         PAGE 1
         MANAGEMENT DASHBOARD
      ================================================= */

      pageTitle(
        "Management Dashboard",
        `${days}-day report | ${displayDate(
          categories.range
            .startDate
        )} to ${displayDate(
          categories.range
            .endDate
        )}`
      );

      /* =================================================
         KPI DATA
      ================================================= */

      const kpis: {
        title: string;

        value: string;

        color: PdfColor;
      }[] = [
        {
          title:
            "Total Users",

          value:
            formatNumber(
              summary.users
            ),

          color:
            cyan,
        },

        {
          title:
            "Tracked Views",

          value:
            formatNumber(
              comparison
                ?.views
                ?.current ??
                summary.views
            ),

          color:
            orange,
        },

        {
          title:
            "Unique Visitors",

          value:
            formatNumber(
              comparison
                ?.uniqueVisitors
                ?.current ??
                summary.uniqueVisitors
            ),

          color:
            green,
        },

        {
          title:
            "Downloads",

          value:
            formatNumber(
              comparison
                ?.downloads
                ?.current ??
                summary.downloads
            ),

          color:
            purple,
        },

        {
          title:
            "Published Content",

          value:
            formatNumber(
              categories.summary
                .totalContent
            ),

          color:
            cyan,
        },
      ];

      const cardGap =
        4;

      const cardWidth =
        (pageWidth -
          28 -
          cardGap *
            4) /
        5;

      /* =================================================
         KPI CARDS
      ================================================= */

      kpis.forEach(
        (
          item,
          index
        ) => {
          const x =
            14 +
            index *
              (cardWidth +
                cardGap);

          setPdfFillColor(
            panel
          );

          doc.roundedRect(
            x,
            42,
            cardWidth,
            28,
            3,
            3,
            "F"
          );

          setPdfTextColor(
            muted
          );

          doc.setFontSize(
            7
          );

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.text(
            item.title.toUpperCase(),
            x +
              4,
            50
          );

          /*
            No ...item.color here.
          */

          doc.setTextColor(
            item.color[0],
            item.color[1],
            item.color[2]
          );

          doc.setFontSize(
            17
          );

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.text(
            item.value,
            x +
              4,
            63
          );
        }
      );

      /* =================================================
         CHARTS
      ================================================= */

      const trafficChart =
        createTrafficChart(
          traffic
        );

      doc.addImage(
        trafficChart,
        "PNG",
        14,
        78,
        130,
        58
      );

      const categoryChart =
        createCategoryChart(
          categoryItems
        );

      doc.addImage(
        categoryChart,
        "PNG",
        153,
        78,
        130,
        58
      );

      /* =================================================
         EXECUTIVE SUMMARY PANEL
      ================================================= */

      setPdfFillColor(
        panel
      );

      doc.roundedRect(
        14,
        143,
        pageWidth -
          28,
        43,
        3,
        3,
        "F"
      );

      setPdfTextColor(
        white
      );

      doc.setFontSize(
        11
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Executive Summary",
        19,
        153
      );

      setPdfTextColor(
        muted
      );

      doc.setFontSize(
        8
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      const summaryLineOne =
        `${formatNumber(
          categories.summary
            .categories
        )} engineering categories currently contain ${formatNumber(
          categories.summary
            .totalContent
        )} published content items.`;

      const summaryLineTwo =
        `${formatNumber(
          trending.summary
            .risingContent
        )} content items are growing or newly active, while ${formatNumber(
          trending.summary
            .decliningContent
        )} show lower engagement than the previous equal period.`;

      const summaryLineThree =
        `The selected period recorded ${formatNumber(
          trending.summary
            .views
        )} tracked views and ${formatNumber(
          trending.summary
            .downloads
        )} tracked downloads in trending analytics.`;

      doc.text(
        summaryLineOne,
        19,
        162,
        {
          maxWidth:
            pageWidth -
            38,
        }
      );

      doc.text(
        summaryLineTwo,
        19,
        171,
        {
          maxWidth:
            pageWidth -
            38,
        }
      );

      doc.text(
        summaryLineThree,
        19,
        180,
        {
          maxWidth:
            pageWidth -
            38,
        }
      );

      footer(
        1
      );

      /* =================================================
         PAGE 2
         PERIOD COMPARISON
      ================================================= */

      doc.addPage();

      pageTitle(
        "Current vs Previous Period",
        `Current ${days}-day period compared with the immediately preceding equal calendar period`
      );

      const comparisonRows: (
        | string
        | number
      )[][] = [
        [
          "Views",

          comparison?.views
            ?.current ??
            0,

          comparison?.views
            ?.previous ??
            0,

          growthText(
            comparison?.views
              ?.changePercent
          ),

          trendText(
            comparison?.views
              ?.trend
          ),
        ],

        [
          "Unique Visitors",

          comparison
            ?.uniqueVisitors
            ?.current ??
            0,

          comparison
            ?.uniqueVisitors
            ?.previous ??
            0,

          growthText(
            comparison
              ?.uniqueVisitors
              ?.changePercent
          ),

          trendText(
            comparison
              ?.uniqueVisitors
              ?.trend
          ),
        ],

        [
          "Downloads",

          comparison
            ?.downloads
            ?.current ??
            0,

          comparison
            ?.downloads
            ?.previous ??
            0,

          growthText(
            comparison
              ?.downloads
              ?.changePercent
          ),

          trendText(
            comparison
              ?.downloads
              ?.trend
          ),
        ],

        [
          "Unique Downloaders",

          comparison
            ?.uniqueDownloaders
            ?.current ??
            0,

          comparison
            ?.uniqueDownloaders
            ?.previous ??
            0,

          growthText(
            comparison
              ?.uniqueDownloaders
              ?.changePercent
          ),

          trendText(
            comparison
              ?.uniqueDownloaders
              ?.trend
          ),
        ],

        [
          "Article Views",

          comparison
            ?.articleViews
            ?.current ??
            0,

          comparison
            ?.articleViews
            ?.previous ??
            0,

          growthText(
            comparison
              ?.articleViews
              ?.changePercent
          ),

          trendText(
            comparison
              ?.articleViews
              ?.trend
          ),
        ],

        [
          "Library Views",

          comparison
            ?.bookViews
            ?.current ??
            0,

          comparison
            ?.bookViews
            ?.previous ??
            0,

          growthText(
            comparison
              ?.bookViews
              ?.changePercent
          ),

          trendText(
            comparison
              ?.bookViews
              ?.trend
          ),
        ],

        [
          "New Users",

          comparison
            ?.newUsers
            ?.current ??
            0,

          comparison
            ?.newUsers
            ?.previous ??
            0,

          growthText(
            comparison
              ?.newUsers
              ?.changePercent
          ),

          trendText(
            comparison
              ?.newUsers
              ?.trend
          ),
        ],
      ];

      autoTable(
        doc,
        {
          startY:
            44,

          head: [
            [
              "Metric",
              "Current",
              "Previous",
              "Change",
              "Trend",
            ],
          ],

          body:
            comparisonRows,

          theme:
            "grid",

          styles: {
            fontSize:
              9,

            cellPadding:
              4,

            textColor:
              [
                226,
                232,
                240,
              ],

            fillColor:
              [
                15,
                23,
                42,
              ],

            lineColor:
              [
                51,
                65,
                85,
              ],

            lineWidth:
              0.2,
          },

          headStyles: {
            fillColor:
              [
                30,
                41,
                59,
              ],

            textColor:
              [
                255,
                255,
                255,
              ],

            fontStyle:
              "bold",
          },

          alternateRowStyles: {
            fillColor:
              [
                8,
                15,
                30,
              ],
          },

          margin: {
            left:
              14,

            right:
              14,
          },
        }
      );

      footer(
        2
      );

      /* =================================================
         PAGE 3
         CATEGORY PERFORMANCE
      ================================================= */

      doc.addPage();

      pageTitle(
        "Category Performance",
        `${days}-day engagement with current published content totals`
      );

      autoTable(
        doc,
        {
          startY:
            43,

          head: [
            [
              "#",
              "Category",
              "Articles",
              "Resources",
              "Views",
              "Downloads",
              "Saves",
              "Score",
            ],
          ],

          body:
            categoryItems.map(
              (
                item,
                index
              ) => [
                index +
                  1,

                item.category,

                item.articles,

                item.resources,

                item.views,

                item.downloads,

                item.bookmarks,

                item.score,
              ]
            ),

          theme:
            "grid",

          styles: {
            fontSize:
              7.5,

            cellPadding:
              2.8,

            textColor:
              [
                226,
                232,
                240,
              ],

            fillColor:
              [
                15,
                23,
                42,
              ],

            lineColor:
              [
                51,
                65,
                85,
              ],

            lineWidth:
              0.15,
          },

          headStyles: {
            fillColor:
              [
                8,
                145,
                178,
              ],

            textColor:
              [
                255,
                255,
                255,
              ],

            fontStyle:
              "bold",
          },

          alternateRowStyles: {
            fillColor:
              [
                8,
                15,
                30,
              ],
          },

          margin: {
            left:
              14,

            right:
              14,
          },
        }
      );

      footer(
        3
      );

      /* =================================================
         PAGE 4
         TRENDING CONTENT
      ================================================= */

      doc.addPage();

      pageTitle(
        "Trending Content",
        "Momentum based on current engagement compared with the previous equal period"
      );

      autoTable(
        doc,
        {
          startY:
            43,

          head: [
            [
              "#",
              "Content",
              "Type",
              "Category",
              "Views",
              "Prev.",
              "Downloads",
              "Growth",
              "Trend",
              "Momentum",
            ],
          ],

          body:
            trendingContent
              .slice(
                0,
                20
              )
              .map(
                (
                  item
                ) => [
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

                  growthText(
                    item.growthPercent
                  ),

                  trendText(
                    item.trend
                  ),

                  item.momentumScore,
                ]
              ),

          theme:
            "grid",

          styles: {
            fontSize:
              7,

            cellPadding:
              2.5,

            textColor:
              [
                226,
                232,
                240,
              ],

            fillColor:
              [
                15,
                23,
                42,
              ],

            lineColor:
              [
                51,
                65,
                85,
              ],

            lineWidth:
              0.15,

            overflow:
              "linebreak",
          },

          headStyles: {
            fillColor:
              [
                190,
                24,
                93,
              ],

            textColor:
              [
                255,
                255,
                255,
              ],

            fontStyle:
              "bold",
          },

          alternateRowStyles: {
            fillColor:
              [
                8,
                15,
                30,
              ],
          },

          columnStyles: {
            0: {
              cellWidth:
                10,
            },

            1: {
              cellWidth:
                64,
            },

            2: {
              cellWidth:
                18,
            },

            3: {
              cellWidth:
                34,
            },

            4: {
              cellWidth:
                18,
            },

            5: {
              cellWidth:
                18,
            },

            6: {
              cellWidth:
                20,
            },

            7: {
              cellWidth:
                18,
            },

            8: {
              cellWidth:
                24,
            },

            9: {
              cellWidth:
                20,
            },
          },

          margin: {
            left:
              10,

            right:
              10,
          },
        }
      );

      footer(
        4
      );

      /* =================================================
         PAGE 5
         TRENDING CATEGORIES
      ================================================= */

      doc.addPage();

      pageTitle(
        "Trending Categories",
        "Category momentum based on tracked views, downloads and previous-period performance"
      );

      autoTable(
        doc,
        {
          startY:
            43,

          head: [
            [
              "#",
              "Category",
              "Active Content",
              "Views",
              "Previous Views",
              "Downloads",
              "Previous Downloads",
              "Growth",
              "Trend",
              "Momentum",
            ],
          ],

          body:
            (
              trending
                .trendingCategories ??
              []
            ).map(
              (
                item
              ) => [
                item.rank,

                item.category,

                item.activeContent,

                item.views,

                item.previousViews,

                item.downloads,

                item.previousDownloads,

                growthText(
                  item.growthPercent
                ),

                trendText(
                  item.trend
                ),

                item.momentumScore,
              ]
            ),

          theme:
            "grid",

          styles: {
            fontSize:
              7,

            cellPadding:
              2.5,

            textColor:
              [
                226,
                232,
                240,
              ],

            fillColor:
              [
                15,
                23,
                42,
              ],

            lineColor:
              [
                51,
                65,
                85,
              ],

            lineWidth:
              0.15,
          },

          headStyles: {
            fillColor:
              [
                126,
                34,
                206,
              ],

            textColor:
              [
                255,
                255,
                255,
              ],

            fontStyle:
              "bold",
          },

          alternateRowStyles: {
            fillColor:
              [
                8,
                15,
                30,
              ],
          },

          margin: {
            left:
              10,

            right:
              10,
          },
        }
      );

      footer(
        5
      );

      /* =================================================
         PAGE 6
         REPORT NOTES
      ================================================= */

      doc.addPage();

      pageTitle(
        "Report Notes & Definitions",
        "How PetroHub analytics figures in this report are interpreted"
      );

      const notes:
        string[][] = [
          [
            "Reporting Period",
            `${days} days`,
          ],

          [
            "Current Period",
            `${displayDate(
              trending.range
                .startDate
            )} to ${displayDate(
              trending.range
                .endDate
            )}`,
          ],

          [
            "Previous Period",
            `${displayDate(
              trending.range
                .previousStartDate
            )} to ${displayDate(
              trending.range
                .previousEndDate
            )}`,
          ],

          [
            "Category Engagement Score",
            "Views x 1 + Downloads x 3 + Saves x 2",
          ],

          [
            "Trending Engagement",
            "Views x 1 + Downloads x 3",
          ],

          [
            "New Activity",
            "Current-period engagement exists while the previous equal period recorded zero engagement.",
          ],

          [
            "Published Content",
            "Category article and resource counts reflect currently published PetroHub content.",
          ],

          [
            "Views",
            "Traffic figures are based on PetroHub tracked analytics view events.",
          ],

          [
            "Downloads",
            "Download analytics uses PetroHub tracked download events and duplicate-suppression rules.",
          ],

          [
            "Historical Analytics",
            "Event-based historical analytics only includes activity recorded after PetroHub event tracking was enabled.",
          ],

          [
            "Generated",
            new Date().toLocaleString(
              "en-IN"
            ),
          ],
        ];

      autoTable(
        doc,
        {
          startY:
            44,

          head: [
            [
              "Item",
              "Definition / Note",
            ],
          ],

          body:
            notes,

          theme:
            "grid",

          styles: {
            fontSize:
              9,

            cellPadding:
              4,

            textColor:
              [
                226,
                232,
                240,
              ],

            fillColor:
              [
                15,
                23,
                42,
              ],

            lineColor:
              [
                51,
                65,
                85,
              ],

            lineWidth:
              0.2,

            overflow:
              "linebreak",
          },

          headStyles: {
            fillColor:
              [
                249,
                115,
                22,
              ],

            textColor:
              [
                255,
                255,
                255,
              ],

            fontStyle:
              "bold",
          },

          alternateRowStyles: {
            fillColor:
              [
                8,
                15,
                30,
              ],
          },

          columnStyles: {
            0: {
              cellWidth:
                65,

              fontStyle:
                "bold",
            },
          },

          margin: {
            left:
              14,

            right:
              14,
          },
        }
      );

      footer(
        6
      );

      /* =================================================
         SAVE PDF
      ================================================= */

      const today =
        new Date()
          .toISOString()
          .slice(
            0,
            10
          );

      doc.save(
        `petrohub-management-analytics-${days}-days-${today}.pdf`
      );
    } catch (
      exportError
    ) {
      console.error(
        "PDF analytics export error:",
        exportError
      );

      setError(
        exportError instanceof
          Error
          ? exportError.message
          : "Unable to generate PDF report."
      );
    } finally {
      setExporting(
        false
      );
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <section className="mb-12 overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-slate-900 to-slate-900">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-2xl">
              📄
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400">
                Management Report
              </p>

              <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                Export Analytics PDF
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Generate a
                presentation-ready
                PetroHub management
                report containing
                KPI cards, traffic
                charts, engineering
                category performance,
                current-vs-previous
                comparison, trending
                content and reporting
                notes.
              </p>
            </div>
          </div>

          {/* =================================================
              CONTROLS
          ================================================= */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* RANGE */}

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
                        ? "bg-purple-500 text-white"
                        : "text-slate-400 hover:text-white"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {value} Days
                  </button>
                )
              )}
            </div>

            {/* EXPORT */}

            <button
              type="button"
              disabled={
                exporting
              }
              onClick={
                exportPdf
              }
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl bg-purple-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                  : "📄"}
              </span>

              {exporting
                ? "Building PDF..."
                : "Export PDF Report"}
            </button>
          </div>
        </div>

        {/* =================================================
            FEATURES
        ================================================= */}

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            "Executive Dashboard",
            "KPI Cards",
            "Traffic Graph",
            "Category Graph",
            "Period Comparison",
            "Category Table",
            "Trending Content",
            "Trending Categories",
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

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs leading-5 text-slate-500">
            <strong className="text-slate-300">
              PDF pages:
            </strong>{" "}
            Management Dashboard
            • Current vs Previous
            Period • Category
            Performance • Trending
            Content • Trending
            Categories • Report
            Notes.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm font-bold text-red-400">
              PDF export failed
            </p>

            <p className="mt-1 text-xs leading-5 text-red-300">
              {error}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}