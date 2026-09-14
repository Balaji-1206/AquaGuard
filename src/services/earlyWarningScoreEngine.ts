/**
 * AquaGuard Early Warning Score (EWS) Engine
 * ====================================================
 * Computes a real-time composite Early Warning Score (0–100) across 4 key sensor
 * parameters (pH, TDS, Turbidity, Flow Rate) plus a deterioration velocity bonus.
 *
 * Risk Tiers:
 *  - 0  to 20 : LOW (System Safe & Normal)
 *  - 21 to 45 : MODERATE (Minor Drift — Early Advisory)
 *  - 46 to 70 : HIGH (Significant Anomaly — Predictive Early Warning)
 *  - 71 to 100: CRITICAL (Severe Hazard / Leak — Emergency Shutoff)
 */

import { SensorReading, EarlyWarningScoreResult, EWSRiskTier, EWSBreakdown } from '../types';
import { SENSOR_THRESHOLDS } from '../constants/thresholds';

/**
 * Calculates the sub-scores and overall Early Warning Score (EWS) for a given sensor reading.
 * Optionally compares against prior readings to compute deterioration velocity.
 */
export function calculateEarlyWarningScore(
  reading: SensorReading,
  previousReadings: SensorReading[] = []
): EarlyWarningScoreResult {
  const { pH, tds, turbidity, flowRate } = reading;

  // 1. pH Risk Sub-Score (0 - 25)
  // Optimal pH: 6.8 - 7.5
  let phScore = 0;
  const phDev = Math.abs(pH - 7.0);
  if (phDev <= 0.5) {
    phScore = 0;
  } else if (phDev <= 1.0) {
    phScore = 8;
  } else if (phDev <= 1.5) {
    phScore = 16;
  } else {
    phScore = 25; // Severe pH anomaly (< 5.5 or > 8.5)
  }

  // 2. TDS Risk Sub-Score (0 - 25)
  // Ideal drinking TDS: 50 - 150 ppm
  let tdsScore = 0;
  if (tds <= SENSOR_THRESHOLDS.tds.maxNormal) {
    tdsScore = Math.max(0, Math.round(((tds - 50) / 100) * 5));
  } else if (tds <= 250) {
    tdsScore = 14;
  } else if (tds <= 400) {
    tdsScore = 20;
  } else {
    tdsScore = 25;
  }

  // 3. Turbidity Risk Sub-Score (0 - 25)
  // Ideal NTU: < 0.5
  let turbidityScore = 0;
  if (turbidity <= SENSOR_THRESHOLDS.turbidity.maxNormal) {
    turbidityScore = Math.round((turbidity / 1.0) * 8);
  } else if (turbidity <= 2.5) {
    turbidityScore = 16;
  } else {
    turbidityScore = 25;
  }

  // 4. Flow Rate Risk Sub-Score (0 - 25)
  // Normal household flow: 0 - 4 L/min
  let flowScore = 0;
  if (flowRate <= 4.0) {
    flowScore = 0;
  } else if (flowRate <= 8.0) {
    flowScore = 12;
  } else if (flowRate <= 12.0) {
    flowScore = 20;
  } else {
    flowScore = 25; // Massive flow spike / leak
  }

  // 5. Rate-of-Change Deterioration Velocity Bonus (0 - 20)
  let velocityBonus = 0;
  let trend: EarlyWarningScoreResult['trend'] = 'STABLE';

  if (previousReadings.length > 0) {
    const prev = previousReadings[previousReadings.length - 1];
    const tdsDelta = tds - prev.tds;
    const phDelta = Math.abs(pH - prev.pH);
    const flowDelta = flowRate - prev.flowRate;
    const turbDelta = turbidity - prev.turbidity;

    if (tdsDelta > 20 || phDelta > 0.8 || flowDelta > 4.0 || turbDelta > 0.8) {
      velocityBonus = 20;
      trend = 'RAPIDLY_DETERIORATING';
    } else if (tdsDelta > 8 || phDelta > 0.3 || flowDelta > 2.0 || turbDelta > 0.3) {
      velocityBonus = 10;
      trend = 'DETERIORATING';
    }
  }

  // Raw sum capped at 100
  const rawSum = phScore + tdsScore + turbidityScore + flowScore + velocityBonus;
  const ewsScore = Math.min(100, Math.max(0, rawSum));

  // Determine Risk Tier (NORMAL, WARNING, CRITICAL)
  let riskTier: EWSRiskTier = 'NORMAL';
  if (ewsScore >= 66) {
    riskTier = 'CRITICAL';
  } else if (ewsScore >= 26) {
    riskTier = 'WARNING';
  } else {
    riskTier = 'NORMAL';
  }

  // Breakdown sub-scores
  const breakdown: EWSBreakdown = {
    phScore,
    tdsScore,
    turbidityScore,
    flowScore,
    velocityBonus,
  };

  // Determine Primary Risk Factor
  let primaryRiskFactor = 'Water quality optimal';
  const subScorePairs = [
    { name: 'pH Anomaly', score: phScore },
    { name: 'Elevated TDS', score: tdsScore },
    { name: 'Turbidity Cloudiness', score: turbidityScore },
    { name: 'Flow Rate Spike', score: flowScore },
    { name: 'Rapid Deterioration Trend', score: velocityBonus },
  ];
  subScorePairs.sort((a, b) => b.score - a.score);

  if (subScorePairs[0].score > 0) {
    primaryRiskFactor = `${subScorePairs[0].name} (Impact: ${subScorePairs[0].score} pts)`;
  }

  // Generate actionable recommendation
  let recommendation = 'SYSTEM NORMAL: All sensor parameters operating within safe baseline range.';
  if (riskTier === 'CRITICAL') {
    recommendation = 'CRITICAL ALERT: High risk detected! Isolate main shutoff valve and inspect line for contamination or leak.';
  } else if (riskTier === 'WARNING') {
    recommendation = 'WARNING ADVISORY: Water quality parameters deteriorating. Inspect RO filter health and inlet supply.';
  }

  return {
    ewsScore,
    riskTier,
    breakdown,
    primaryRiskFactor,
    recommendation,
    trend,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Returns color token associated with an EWS risk tier.
 */
export function getEWSTierColor(riskTier: EWSRiskTier): { bg: string; text: string; badge: string } {
  switch (riskTier) {
    case 'CRITICAL':
      return { bg: '#FEF2F2', text: '#EF4444', badge: '#DC2626' };
    case 'WARNING':
      return { bg: '#FFF7ED', text: '#F97316', badge: '#F59E0B' };
    case 'NORMAL':
    default:
      return { bg: '#F0FDF4', text: '#22C55E', badge: '#16A34A' };
  }
}

