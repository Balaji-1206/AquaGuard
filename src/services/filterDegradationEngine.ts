/**
 * AquaGuard Filter Degradation Prediction Engine
 * ===============================================
 * Novelty 1: Pure-TypeScript polynomial regression model that predicts
 * actual RO filter lifespan based on observed sensor load history —
 * not a simple calendar countdown.
 *
 * Algorithm:
 *  1. For each historical day, compute a composite "load score":
 *     load = (tds / 150) * 1.5 + (turbidity / 1.0) * 3.0 + (flowLiters / 300) * 1.0
 *  2. Fit a linear regression on load scores to determine degradation trend
 *  3. Project trend forward to predict remaining health days
 *  4. Return prediction with confidence band
 */

import { FilterDayLoad, FilterPrediction, ROFilterCartridge } from '../types';

// ─── Sensor weight constants ──────────────────────────────────────────────────
const TDS_WEIGHT       = 1.5;  // TDS contributes 1.5x
const TURBIDITY_WEIGHT = 3.0;  // Turbidity is most corrosive — 3x
const FLOW_WEIGHT      = 1.0;  // Flow volume is baseline

const TDS_REFERENCE       = 150;  // ppm — reference normal TDS
const TURBIDITY_REFERENCE = 1.0;  // NTU — reference normal turbidity
const FLOW_REFERENCE      = 300;  // liters/day — reference normal daily flow

/**
 * Compute daily composite load score for a single day's readings.
 * A score of 1.0 = perfectly normal load. > 1.0 = elevated load.
 */
function computeLoadScore(day: FilterDayLoad): number {
  const tdsLoad       = (day.avgTds / TDS_REFERENCE) * TDS_WEIGHT;
  const turbidityLoad = (day.avgTurbidity / TURBIDITY_REFERENCE) * TURBIDITY_WEIGHT;
  const flowLoad      = (day.avgFlowLiters / FLOW_REFERENCE) * FLOW_WEIGHT;
  // Normalise to a score where 1.0 = baseline wear rate
  return (tdsLoad + turbidityLoad + flowLoad) / (TDS_WEIGHT + TURBIDITY_WEIGHT + FLOW_WEIGHT);
}

/**
 * Simple least-squares linear regression.
 * Returns { slope, intercept, r2 } for y = slope * x + intercept
 */
function linearRegression(xs: number[], ys: number[]): { slope: number; intercept: number; r2: number } {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0, r2: 0 };

  const sumX  = xs.reduce((a, b) => a + b, 0);
  const sumY  = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumXX = xs.reduce((a, x) => a + x * x, 0);
  const meanY = sumY / n;

  const slope     = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Coefficient of determination R²
  const ssTot = ys.reduce((a, y) => a + Math.pow(y - meanY, 2), 0);
  const ssRes = ys.reduce((a, y, i) => a + Math.pow(y - (slope * xs[i] + intercept), 2), 0);
  const r2    = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

/**
 * Predict remaining filter lifespan for a single filter cartridge.
 *
 * @param filter - Current filter cartridge state
 * @param history - Ordered array of daily load records (oldest first, at least 3 days)
 * @returns FilterPrediction with AI-forecast days remaining and confidence
 */
export function predictFilterLifespan(
  filter: ROFilterCartridge,
  history: FilterDayLoad[]
): FilterPrediction {
  if (history.length < 3) {
    // Not enough data — fall back to calendar estimate
    return {
      filterId:             filter.id,
      predictedDays:        filter.daysRemaining,
      calendarDays:         filter.daysRemaining,
      confidencePercent:    20,
      degradationTrend:     'STABLE',
      dailyDegradationRate: 100 / (filter.daysRemaining + filter.healthPercent * 0.5 || 1),
    };
  }

  // 1. Compute load scores for each historical day
  const loadScores = history.map(computeLoadScore);
  const xs = history.map((_, i) => i);  // Day indices

  // 2. Fit regression on load scores
  const { slope, intercept, r2 } = linearRegression(xs, loadScores);

  // 3. Project average future load score (extrapolate 7 days ahead)
  const futureDays = 7;
  const lastIdx    = history.length - 1;
  const projectedLoads: number[] = Array.from({ length: futureDays }, (_, i) => {
    const futureLoad = slope * (lastIdx + 1 + i) + intercept;
    return Math.max(0.3, futureLoad); // clamp minimum load to 0.3
  });
  const avgFutureLoad = projectedLoads.reduce((a, b) => a + b, 0) / futureDays;

  // 4. Baseline degradation at reference load = 1.0
  //    Infer from current health and calendar remaining
  const totalExpectedLife = filter.daysRemaining + (100 - filter.healthPercent) * (filter.daysRemaining / filter.healthPercent || 1);
  const baselineDailyRate = 100 / Math.max(1, totalExpectedLife); // % per day at load=1.0

  // 5. Adjusted daily degradation at projected load
  const adjustedDailyRate = baselineDailyRate * avgFutureLoad;

  // 6. Predicted days = remaining health / adjusted daily rate
  const predictedDays = Math.round(Math.max(0, filter.healthPercent / adjustedDailyRate));

  // 7. Confidence based on R² of historical fit (higher = more confident)
  const confidencePercent = Math.round(Math.max(20, Math.min(95, r2 * 100)));

  // 8. Classify degradation trend
  const recentSlope = slope; // positive slope = load increasing = ACCELERATING
  const degradationTrend: FilterPrediction['degradationTrend'] =
    recentSlope > 0.02  ? 'ACCELERATING'
    : recentSlope < -0.02 ? 'RECOVERING'
    : 'STABLE';

  return {
    filterId:             filter.id,
    predictedDays:        Math.min(predictedDays, filter.daysRemaining * 2), // sanity cap
    calendarDays:         filter.daysRemaining,
    confidencePercent,
    degradationTrend,
    dailyDegradationRate: parseFloat(adjustedDailyRate.toFixed(3)),
  };
}

/**
 * Run predictions for all filters simultaneously.
 */
export function predictAllFilters(
  filters: ROFilterCartridge[],
  historyMap: Record<string, FilterDayLoad[]>
): FilterPrediction[] {
  return filters.map((f) => predictFilterLifespan(f, historyMap[f.id] ?? []));
}

/**
 * Compute a human-readable confidence band string.
 * e.g. "± 4 days"
 */
export function getConfidenceBand(prediction: FilterPrediction): string {
  const margin = Math.round((1 - prediction.confidencePercent / 100) * prediction.predictedDays * 0.5);
  return `± ${Math.max(1, margin)} day${margin !== 1 ? 's' : ''}`;
}
