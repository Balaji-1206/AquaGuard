import { SensorReading, WaterQualityStatus, HomeAIInsight } from '../types';
import { SENSOR_THRESHOLDS } from '../constants/thresholds';

/**
 * Classifies Smart Home Water Purity & Safety Applications
 */
export const classifyHomeWaterQuality = (reading: SensorReading): HomeAIInsight => {
  let penaltyCount = 0;

  // Check pH
  if (reading.pH < SENSOR_THRESHOLDS.pH.minNormal || reading.pH > SENSOR_THRESHOLDS.pH.maxNormal) {
    penaltyCount += 1;
  }

  // Check TDS
  if (reading.tds > SENSOR_THRESHOLDS.tds.maxNormal) {
    penaltyCount += 1;
  }

  // Check Turbidity
  if (reading.turbidity > SENSOR_THRESHOLDS.turbidity.maxNormal) {
    penaltyCount += 2;
  }

  let status: WaterQualityStatus = 'SAFE';
  let safeForDrinking = true;
  let safeForCooking = true;
  let safeForBabyFormula = true;
  let safeForBathing = true;

  if (penaltyCount >= 3) {
    status = 'UNSAFE';
    safeForDrinking = false;
    safeForBabyFormula = false;
    safeForCooking = false;
  } else if (penaltyCount >= 1) {
    status = 'BORDERLINE';
    safeForBabyFormula = false;
  }

  const purityScore = Math.max(70, Math.min(100, 100 - penaltyCount * 5));

  return {
    waterClassification: status,
    purityScore,
    safeForDrinking,
    safeForCooking,
    safeForBabyFormula,
    safeForBathing,
    reasoning: `Kitchen RO Purifier TDS is ${reading.tds} ppm with ${reading.turbidity} NTU turbidity. Water purity score is ${purityScore}%.`,
    recommendedActions: [
      'RO Purifier filter performance is optimal.',
      'Water is suitable for drinking and cooking.',
    ],
  };
};

export const getWaterStatusColor = (status: WaterQualityStatus): string => {
  switch (status) {
    case 'SAFE':
      return '#2E7D32';
    case 'BORDERLINE':
      return '#F9A825';
    case 'UNSAFE':
      return '#E65100';
    case 'HAZARDOUS':
      return '#D32F2F';
    default:
      return '#1565C0';
  }
};
