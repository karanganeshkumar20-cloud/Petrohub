import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  requireAdmin,
} from "@/lib/admin";

import User from "@/models/User";

import {
  BookmarkModel,
} from "@/models/Bookmark";

import {
  AnalyticsEventModel,
} from "@/models/AnalyticsEvent";

import {
  AnalyticsGoalModel,
  type AnalyticsGoalMetric,
} from "@/models/AnalyticsGoal";

/* =========================================================
   NEXT.JS CONFIG
========================================================= */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =========================================================
   TYPES
========================================================= */

type GoalStatus =
  | "not_set"
  | "achieved"
  | "on_track"
  | "behind";

type GoalResponseItem = {
  metric:
    AnalyticsGoalMetric;

  label:
    string;

  target:
    number;

  current:
    number;

  remaining:
    number;

  progressPercent:
    number;

  projected:
    number;

  projectedPercent:
    number;

  status:
    GoalStatus;
};

type GoalUpdateBody = {
  users?: number;

  views?: number;

  downloads?: number;

  bookmarks?: number;
};

type StoredGoal = {
  metric:
    AnalyticsGoalMetric;

  target:
    number;

  period:
    "monthly";
};

/* =========================================================
   METRIC LABEL
========================================================= */

function getMetricLabel(
  metric:
    AnalyticsGoalMetric
) {
  switch (
    metric
  ) {
    case "users":
      return "New Users";

    case "views":
      return "Tracked Views";

    case "downloads":
      return "Downloads";

    case "bookmarks":
      return "New Saves";

    default:
      return "Metric";
  }
}

/* =========================================================
   MONTH RANGE
========================================================= */

function getCurrentMonthRange() {
  const now =
    new Date();

  /*
    Current UTC month
    starting date.
  */

  const start =
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1,
        0,
        0,
        0,
        0
      )
    );

  /*
    First day of
    next month.
  */

  const nextMonth =
    new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() + 1,
        1,
        0,
        0,
        0,
        0
      )
    );

  /*
    Calculate number of
    days in current month.
  */

  const daysInMonth =
    Math.round(
      (
        nextMonth.getTime() -
        start.getTime()
      ) /
        86_400_000
    );

  /*
    Current UTC calendar day.

    Day 1 is treated
    as one elapsed day.
  */

  const daysElapsed =
    Math.max(
      1,
      Math.min(
        daysInMonth,
        now.getUTCDate()
      )
    );

  const daysRemaining =
    Math.max(
      daysInMonth -
        daysElapsed,
      0
    );

  return {
    now,
    start,
    nextMonth,
    daysInMonth,
    daysElapsed,
    daysRemaining,
  };
}

/* =========================================================
   CALCULATE KPI
========================================================= */

function calculateGoal(
  metric:
    AnalyticsGoalMetric,

  target:
    number,

  current:
    number,

  daysElapsed:
    number,

  daysInMonth:
    number
): GoalResponseItem {
  /*
    Projection:

    Current result
    ÷ elapsed days
    × total month days
  */

  const projected =
    current > 0
      ? Math.round(
          (
            current /
            daysElapsed
          ) *
            daysInMonth
        )
      : 0;

  /*
    Actual target
    completion percentage.
  */

  const progressPercent =
    target > 0
      ? Math.round(
          (
            current /
            target
          ) *
            1000
        ) / 10
      : 0;

  /*
    Projected month-end
    target percentage.
  */

  const projectedPercent =
    target > 0
      ? Math.round(
          (
            projected /
            target
          ) *
            1000
        ) / 10
      : 0;

  /*
    Remaining target.
  */

  const remaining =
    target > 0
      ? Math.max(
          target -
            current,
          0
        )
      : 0;

  /*
    Status.
  */

  let status:
    GoalStatus =
    "not_set";

  if (
    target > 0
  ) {
    if (
      current >=
      target
    ) {
      status =
        "achieved";
    } else if (
      projected >=
      target
    ) {
      status =
        "on_track";
    } else {
      status =
        "behind";
    }
  }

  return {
    metric,

    label:
      getMetricLabel(
        metric
      ),

    target,

    current,

    remaining,

    progressPercent,

    projected,

    projectedPercent,

    status,
  };
}

/* =========================================================
   GET
   LOAD MONTHLY KPI GOALS
========================================================= */

export async function GET() {
  try {
    /* =====================================================
       ADMIN AUTHORIZATION
    ===================================================== */

    const admin =
      await requireAdmin();

    if (
      !admin.authorized
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            admin.message,
        },
        {
          status:
            admin.status,
        }
      );
    }

    /* =====================================================
       DATABASE
    ===================================================== */

    await connectDB();

    /* =====================================================
       MONTH PERIOD
    ===================================================== */

    const {
      now,
      start,
      nextMonth,
      daysInMonth,
      daysElapsed,
      daysRemaining,
    } =
      getCurrentMonthRange();

    /* =====================================================
       CURRENT MONTH ANALYTICS
    ===================================================== */

    const [
      currentUsers,
      currentViews,
      currentDownloads,
      currentBookmarks,
      storedGoalDocuments,
    ] =
      await Promise.all([
        /* ===============================================
           NEW USERS
        =============================================== */

        User.countDocuments(
          {
            createdAt: {
              $gte:
                start,

              $lt:
                nextMonth,
            },
          }
        ),

        /* ===============================================
           TRACKED VIEWS
        =============================================== */

        AnalyticsEventModel.countDocuments(
          {
            eventType:
              "view",

            occurredAt: {
              $gte:
                start,

              $lt:
                nextMonth,
            },
          }
        ),

        /* ===============================================
           DOWNLOADS
        =============================================== */

        AnalyticsEventModel.countDocuments(
          {
            eventType:
              "download",

            occurredAt: {
              $gte:
                start,

              $lt:
                nextMonth,
            },
          }
        ),

        /* ===============================================
           SAVES / BOOKMARKS
        =============================================== */

        BookmarkModel.countDocuments(
          {
            createdAt: {
              $gte:
                start,

              $lt:
                nextMonth,
            },
          }
        ),

        /* ===============================================
           SAVED KPI TARGETS
        =============================================== */

        AnalyticsGoalModel.find(
          {
            period:
              "monthly",
          }
        )
          .select(
            "metric target period"
          )
          .lean(),
      ]);

    /* =====================================================
       SAFE LEAN TYPE
    ===================================================== */

    const storedGoals =
      storedGoalDocuments as unknown as
        StoredGoal[];

    /* =====================================================
       DEFAULT TARGETS
    ===================================================== */

    const targetMap:
      Record<
        AnalyticsGoalMetric,
        number
      > = {
        users:
          0,

        views:
          0,

        downloads:
          0,

        bookmarks:
          0,
      };

    /* =====================================================
       LOAD TARGETS
    ===================================================== */

    storedGoals.forEach(
      (
        goal
      ) => {
        if (
          goal.metric ===
            "users" ||
          goal.metric ===
            "views" ||
          goal.metric ===
            "downloads" ||
          goal.metric ===
            "bookmarks"
        ) {
          targetMap[
            goal.metric
          ] =
            Number(
              goal.target ??
                0
            );
        }
      }
    );

    /* =====================================================
       CALCULATE KPI RESULTS
    ===================================================== */

    const goals:
      GoalResponseItem[] = [
        calculateGoal(
          "users",

          targetMap.users,

          currentUsers,

          daysElapsed,

          daysInMonth
        ),

        calculateGoal(
          "views",

          targetMap.views,

          currentViews,

          daysElapsed,

          daysInMonth
        ),

        calculateGoal(
          "downloads",

          targetMap.downloads,

          currentDownloads,

          daysElapsed,

          daysInMonth
        ),

        calculateGoal(
          "bookmarks",

          targetMap.bookmarks,

          currentBookmarks,

          daysElapsed,

          daysInMonth
        ),
      ];

    /* =====================================================
       CONFIGURED GOALS
    ===================================================== */

    const configuredGoals =
      goals.filter(
        (
          goal
        ) =>
          goal.target >
          0
      );

    /* =====================================================
       SUMMARY
    ===================================================== */

    const achieved =
      configuredGoals.filter(
        (
          goal
        ) =>
          goal.status ===
          "achieved"
      ).length;

    const onTrack =
      configuredGoals.filter(
        (
          goal
        ) =>
          goal.status ===
          "on_track"
      ).length;

    const behind =
      configuredGoals.filter(
        (
          goal
        ) =>
          goal.status ===
          "behind"
      ).length;

    /* =====================================================
       RETURN RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success:
          true,

        period: {
          type:
            "monthly",

          startDate:
            start.toISOString(),

          endDate:
            nextMonth.toISOString(),

          generatedAt:
            now.toISOString(),

          daysElapsed,

          daysInMonth,

          daysRemaining,
        },

        summary: {
          configured:
            configuredGoals.length,

          achieved,

          onTrack,

          behind,
        },

        goals,
      },
      {
        status:
          200,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "Analytics goals GET error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to load analytics goals.",
      },
      {
        status:
          500,
      }
    );
  }
}

/* =========================================================
   PUT
   UPDATE MONTHLY KPI TARGETS
========================================================= */

export async function PUT(
  request:
    NextRequest
) {
  try {
    /* =====================================================
       ADMIN AUTHORIZATION
    ===================================================== */

    const admin =
      await requireAdmin();

    if (
      !admin.authorized
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            admin.message,
        },
        {
          status:
            admin.status,
        }
      );
    }

    /* =====================================================
       DATABASE
    ===================================================== */

    await connectDB();

    /* =====================================================
       REQUEST BODY
    ===================================================== */

    const body =
      (await request.json()) as
        GoalUpdateBody;

    const metrics:
      AnalyticsGoalMetric[] =
      [
        "users",
        "views",
        "downloads",
        "bookmarks",
      ];

    /* =====================================================
       VALIDATE ALL PROVIDED VALUES
    ===================================================== */

    for (
      const metric of
        metrics
    ) {
      const value =
        body[
          metric
        ];

      /*
        Undefined means this
        target was not supplied.
      */

      if (
        value ===
        undefined
      ) {
        continue;
      }

      /*
        Must be number.
      */

      if (
        typeof value !==
          "number" ||
        !Number.isFinite(
          value
        )
      ) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              `${getMetricLabel(
                metric
              )} target must be a valid number.`,
          },
          {
            status:
              400,
          }
        );
      }

      /*
        Must not be negative.
      */

      if (
        value <
        0
      ) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              `${getMetricLabel(
                metric
              )} target cannot be negative.`,
          },
          {
            status:
              400,
          }
        );
      }

      /*
        Whole numbers only.
      */

      if (
        !Number.isInteger(
          value
        )
      ) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              `${getMetricLabel(
                metric
              )} target must be a whole number.`,
          },
          {
            status:
              400,
          }
        );
      }
    }

    /* =====================================================
       MAKE SURE SOMETHING WAS PROVIDED
    ===================================================== */

    const hasValues =
      metrics.some(
        (
          metric
        ) =>
          body[
            metric
          ] !==
          undefined
      );

    if (
      !hasValues
    ) {
      return NextResponse.json(
        {
          success:
            false,

          message:
            "No KPI targets were provided.",
        },
        {
          status:
            400,
        }
      );
    }

    /* =====================================================
       BUILD DATABASE OPERATIONS
    ===================================================== */

    const operations =
      metrics
        .filter(
          (
            metric
          ) =>
            body[
              metric
            ] !==
            undefined
        )
        .map(
          (
            metric
          ) => {
            const target =
              body[
                metric
              ] as number;

            return AnalyticsGoalModel.findOneAndUpdate(
              {
                metric,
              },

              {
                $set: {
                  metric,

                  target,

                  period:
                    "monthly",
                },
              },

              {
                upsert:
                  true,

                new:
                  true,

                runValidators:
                  true,

                setDefaultsOnInsert:
                  true,
              }
            );
          }
        );

    /* =====================================================
       SAVE
    ===================================================== */

    await Promise.all(
      operations
    );

    /* =====================================================
       SUCCESS RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success:
          true,

        message:
          "Monthly analytics targets updated successfully.",
      },
      {
        status:
          200,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "Analytics goals PUT error:",
      error
    );

    return NextResponse.json(
      {
        success:
          false,

        message:
          "Unable to update analytics goals.",
      },
      {
        status:
          500,
      }
    );
  }
}