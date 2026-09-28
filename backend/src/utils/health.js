/**
 * health.js
 * Pure calculation helpers shared by the logs and analytics routes:
 * BMI, BMI categorization, blood-pressure staging, rolling moving
 * averages, and week-over-week trend deltas.
 */

export function calculateBmi(weightKg, heightCm) {
  const heightM = heightCm / 100;
  if (heightM <= 0) throw new Error("height_cm must be a positive number");
  return Math.round((weightKg / (heightM * heightM)) * 100) / 100;
}

export function classifyBmi(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/** American Heart Association blood-pressure staging. */
export function classifyBloodPressure(systolic, diastolic) {
  if (systolic == null || diastolic == null) return "Unknown";
  if (systolic >= 180 || diastolic >= 120) return "Hypertensive Crisis";
  if (systolic >= 140 || diastolic >= 90) return "Hypertension Stage 2";
  if (systolic >= 130 || diastolic >= 80) return "Hypertension Stage 1";
  if (systolic >= 120 && diastolic < 80) return "Elevated";
  if (systolic < 120 && diastolic < 80) return "Normal";
  return "Elevated";
}

/**
 * Add rolling moving-average fields to a chronologically-sorted
 * (oldest first) array of log rows, for the given numeric field.
 */
function rollingAverage(rows, field, window) {
  return rows.map((row, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = rows.slice(start, index + 1).map((r) => r[field]).filter((v) => v != null && !Number.isNaN(v));
    if (slice.length === 0) return null;
    const avg = slice.reduce((sum, v) => sum + Number(v), 0) / slice.length;
    return Math.round(avg * 100) / 100;
  });
}

/**
 * Enrich chronologically-sorted logs with 7-day and 30-day rolling
 * averages for weight and steps, plus a per-row BP status label.
 */
export function enrichLogs(rows) {
  const weightMa7 = rollingAverage(rows, "weight_kg", 7);
  const weightMa30 = rollingAverage(rows, "weight_kg", 30);
  const stepsMa7 = rollingAverage(rows, "daily_steps", 7);
  const stepsMa30 = rollingAverage(rows, "daily_steps", 30);

  return rows.map((row, index) => ({
    ...row,
    weight_ma_7: weightMa7[index],
    weight_ma_30: weightMa30[index],
    steps_ma_7: stepsMa7[index],
    steps_ma_30: stepsMa30[index],
    bp_status: classifyBloodPressure(row.systolic_bp, row.diastolic_bp),
  }));
}

/**
 * Compare the mean of the most recent 7 entries against the mean of
 * the 7 entries before that. Returns null without enough history.
 */
export function weekOverWeekDelta(rows, field) {
  const values = rows.map((r) => r[field]).filter((v) => v != null && !Number.isNaN(v));
  if (values.length < 2) return null;
  const recent = values.slice(-7);
  const prior = values.slice(Math.max(0, values.length - 14), Math.max(0, values.length - 7));
  if (prior.length === 0) return null;
  const mean = (arr) => arr.reduce((s, v) => s + Number(v), 0) / arr.length;
  return Math.round((mean(recent) - mean(prior)) * 100) / 100;
}

/**
 * Build the full headline-metrics summary the dashboard needs from a
 * chronologically-sorted (oldest first) array of log rows.
 */
export function buildSummary(rows) {
  if (!rows || rows.length === 0) {
    return {
      totalWaterLiters: 0,
      averageSleepHours: 0,
      averageSteps: 0,
      latest: null,
      trends: {},
      logs: [],
    };
  }

  const enriched = enrichLogs(rows);
  const latest = enriched[enriched.length - 1];

  const sum = (field) => rows.reduce((s, r) => s + (Number(r[field]) || 0), 0);
  const avg = (field) => {
    const vals = rows.map((r) => r[field]).filter((v) => v != null && !Number.isNaN(v));
    if (vals.length === 0) return 0;
    return Math.round((vals.reduce((s, v) => s + Number(v), 0) / vals.length) * 100) / 100;
  };

  const trends = {
    weight: {
      label: "Weight",
      value: latest.weight_kg,
      unit: "kg",
      delta: weekOverWeekDelta(rows, "weight_kg"),
    },
    steps: {
      label: "Daily Steps",
      value: latest.daily_steps,
      unit: "steps",
      delta: weekOverWeekDelta(rows, "daily_steps"),
    },
    sleep: {
      label: "Sleep",
      value: latest.sleep_hours,
      unit: "hrs",
      delta: weekOverWeekDelta(rows, "sleep_hours"),
    },
    bmi: {
      label: "BMI",
      value: latest.bmi,
      unit: "",
      delta: weekOverWeekDelta(rows, "bmi"),
    },
  };

  return {
    totalWaterLiters: Math.round(sum("water_liters") * 100) / 100,
    averageSleepHours: avg("sleep_hours"),
    averageSteps: Math.round(avg("daily_steps")),
    latest,
    trends,
    logs: enriched,
  };
}
