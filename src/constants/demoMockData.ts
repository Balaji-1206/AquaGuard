/**
 * AquaGuard Demo Mock Data
 * ========================
 * Rich, realistic sensor data for 5 distinct scenarios used when no
 * physical ESP32 or backend server is connected (Demo Mode).
 *
 * Each scenario simulates a real-world household water event with
 * accurate diurnal variation across all 4 home zones.
 */

import {
  SmartWaterDevice,
  SensorReading,
  HomeAlert,
  TankLevelInfo,
  WaterUsageStats,
  HomeAIInsight,
  FilterDayLoad,
  DemoScenarioName,
} from '../types';

// ─── Diurnal Reading Profiles ─────────────────────────────────────────────────
// 24-hour time-series (hourly) with natural variation for the RO Purifier

export const DEMO_HOURLY_READINGS: SensorReading[] = Array.from({ length: 24 }, (_, h) => {
  // pH rises slightly in morning (degassing), dips at peak usage noon
  const phBase = 7.2 + Math.sin((h - 6) * (Math.PI / 12)) * 0.08;
  // TDS rises after morning/evening usage peaks
  const tdsBase = 85 + (h >= 6 && h <= 9 ? 8 : h >= 18 && h <= 21 ? 6 : 0) + (Math.random() * 3 - 1.5);
  // Temperature tracks ambient — cooler at night, warmer midday
  const tempBase = 22 + Math.sin((h - 6) * (Math.PI / 12)) * 3.5;
  // Flow: active during usage windows
  const flowBase = h >= 6 && h <= 8 ? 2.2 : h >= 12 && h <= 13 ? 1.5 : h >= 18 && h <= 20 ? 1.9 : 0.0;

  return {
    pH: parseFloat(Math.max(6.8, Math.min(7.7, phBase)).toFixed(2)),
    tds: Math.round(Math.max(70, Math.min(120, tdsBase))),
    temperature: parseFloat(Math.max(19, Math.min(30, tempBase)).toFixed(1)),
    turbidity: parseFloat((0.15 + Math.random() * 0.1).toFixed(2)),
    flowRate: parseFloat(Math.max(0, flowBase + (Math.random() * 0.2 - 0.1)).toFixed(1)),
    timestamp: new Date(Date.now() - (23 - h) * 3_600_000).toISOString(),
  };
});

// ─── Scenario Definitions ────────────────────────────────────────────────────

export interface DemoScenario {
  name: DemoScenarioName;
  label: string;
  emoji: string;
  description: string;
  devices: SmartWaterDevice[];
  alerts: HomeAlert[];
  tankInfo: TankLevelInfo;
  usageStats: WaterUsageStats;
  aiInsight: HomeAIInsight;
}

// Helper: base timestamp offset
const ts = (minutesAgo: number) =>
  new Date(Date.now() - minutesAgo * 60_000).toISOString();

// ─── Scenario 1: NORMAL_DAY ───────────────────────────────────────────────────
const NORMAL_DAY_DEVICES: SmartWaterDevice[] = [
  {
    id: 'DEV-RO-01', name: 'Kitchen RO Purifier',
    zone: 'Kitchen RO Purifier', location: 'Main Kitchen Counter',
    status: 'ONLINE', battery: 100, wifiSignal: -52, lastSeen: 'Just now',
    waterStatus: 'SAFE', valveState: 'OPEN',
    readings: { pH: 7.2, tds: 85, temperature: 24.5, turbidity: 0.20, flowRate: 1.8, timestamp: ts(0) },
  },
  {
    id: 'DEV-TANK-02', name: 'Overhead Roof Tank Sensor',
    zone: 'Overhead Roof Tank', location: 'Terrace Level 2 Tank',
    status: 'ONLINE', battery: 88, wifiSignal: -64, lastSeen: '2 mins ago',
    waterStatus: 'SAFE', valveState: 'OPEN',
    readings: { pH: 7.4, tds: 210, temperature: 27.8, turbidity: 1.1, flowRate: 0.0, timestamp: ts(2) },
  },
  {
    id: 'DEV-VALVE-03', name: 'Smart Main Shutoff Valve',
    zone: 'Underground Sump', location: 'Sump Pump Inlet',
    status: 'ONLINE', battery: 95, wifiSignal: -58, lastSeen: '1 min ago',
    waterStatus: 'SAFE', valveState: 'OPEN',
    readings: { pH: 7.3, tds: 220, temperature: 26.0, turbidity: 1.4, flowRate: 3.2, timestamp: ts(1) },
  },
  {
    id: 'DEV-BATH-04', name: 'Bathroom Softener Unit',
    zone: 'Bathroom Supply', location: 'Master Bathroom Header',
    status: 'ONLINE', battery: 78, wifiSignal: -71, lastSeen: '5 mins ago',
    waterStatus: 'SAFE', valveState: 'OPEN',
    readings: { pH: 7.1, tds: 140, temperature: 28.2, turbidity: 0.5, flowRate: 4.2, timestamp: ts(5) },
  },
];

// ─── Scenario 2: HIGH_TDS_EVENT ───────────────────────────────────────────────
const HIGH_TDS_DEVICES: SmartWaterDevice[] = NORMAL_DAY_DEVICES.map((d) =>
  d.id === 'DEV-RO-01'
    ? { ...d, waterStatus: 'BORDERLINE', readings: { ...d.readings, tds: 248, pH: 7.0, turbidity: 0.6, timestamp: ts(0) } }
    : d.id === 'DEV-TANK-02'
    ? { ...d, readings: { ...d.readings, tds: 315, turbidity: 1.8, timestamp: ts(3) } }
    : d
);

// ─── Scenario 3: PIPE_LEAK_EMERGENCY ──────────────────────────────────────────
const PIPE_LEAK_DEVICES: SmartWaterDevice[] = NORMAL_DAY_DEVICES.map((d) =>
  d.id === 'DEV-VALVE-03'
    ? {
        ...d, waterStatus: 'UNSAFE', valveState: 'CLOSED',
        readings: { ...d.readings, flowRate: 14.8, pH: 7.3, tds: 225, timestamp: ts(0) },
      }
    : d.id === 'DEV-TANK-02'
    ? { ...d, readings: { ...d.readings, flowRate: 0.0, turbidity: 2.2, timestamp: ts(1) } }
    : d
);

// ─── Scenario 4: PH_DROP_ANOMALY ─────────────────────────────────────────────
const PH_DROP_DEVICES: SmartWaterDevice[] = NORMAL_DAY_DEVICES.map((d) =>
  d.id === 'DEV-RO-01'
    ? {
        ...d, waterStatus: 'UNSAFE',
        readings: { ...d.readings, pH: 5.9, tds: 92, turbidity: 0.8, timestamp: ts(0) },
      }
    : d.id === 'DEV-BATH-04'
    ? { ...d, readings: { ...d.readings, pH: 6.1, turbidity: 0.9, timestamp: ts(4) } }
    : d
);

// ─── Scenario 5: POST_RAIN_TURBIDITY ─────────────────────────────────────────
const POST_RAIN_DEVICES: SmartWaterDevice[] = NORMAL_DAY_DEVICES.map((d) => ({
  ...d,
  readings: {
    ...d.readings,
    turbidity:
      d.id === 'DEV-VALVE-03' ? 4.2
      : d.id === 'DEV-TANK-02' ? 3.1
      : d.id === 'DEV-BATH-04' ? 2.6
      : 0.9,
    tds: d.id === 'DEV-RO-01' ? 95 : d.readings.tds + 35,
    timestamp: ts(0),
  },
  waterStatus: d.id === 'DEV-RO-01' ? 'SAFE' : 'BORDERLINE',
}));

// ─── Alerts per scenario ─────────────────────────────────────────────────────

const NORMAL_ALERTS: HomeAlert[] = [
  {
    id: 'demo_n1', time: '20 mins ago', deviceName: 'Kitchen RO Purifier',
    zone: 'Kitchen RO Purifier', severity: 'WARNING',
    title: 'UV Lamp Lifespan Warning',
    message: 'UV Sterilization Lamp at 22% health. 12 days remaining. Order replacement kit.',
    actionTaken: 'Auto-reorder reminder queued.', isResolved: false,
  },
  {
    id: 'demo_n2', time: '2 hours ago', deviceName: 'Overhead Roof Tank Sensor',
    zone: 'Overhead Roof Tank', severity: 'INFO',
    title: 'Roof Tank Full',
    message: 'Tank reached 85% capacity. Sump pump auto-shutoff triggered.',
    actionTaken: 'Pump stopped automatically.', isResolved: true,
  },
];

const HIGH_TDS_ALERTS: HomeAlert[] = [
  {
    id: 'demo_t1', time: 'Just now', deviceName: 'Kitchen RO Purifier',
    zone: 'Kitchen RO Purifier', severity: 'WARNING',
    title: 'TDS Elevated — RO Filter Inspection Needed',
    message: 'TDS level reached 248 ppm (ideal: 50–150 ppm). RO membrane may require replacement.',
    actionTaken: 'Filter health check queued.', isResolved: false,
  },
  {
    id: 'demo_t2', time: '5 mins ago', deviceName: 'Overhead Roof Tank Sensor',
    zone: 'Overhead Roof Tank', severity: 'WARNING',
    title: 'High TDS in Storage Tank',
    message: 'Tank TDS measured at 315 ppm. Municipal supply quality degraded.',
    actionTaken: 'Logged to purity timeline.', isResolved: false,
  },
  ...NORMAL_ALERTS,
];

const PIPE_LEAK_ALERTS: HomeAlert[] = [
  {
    id: 'demo_l1', time: 'Just now', deviceName: 'Smart Main Shutoff Valve',
    zone: 'Underground Sump', severity: 'CRITICAL',
    title: 'HIGH PRESSURE PIPE LEAK DETECTED',
    message: 'Abnormal flow rate spike of 14.8 L/min in Sump Inlet. Emergency shutoff valve closed.',
    actionTaken: 'Emergency solenoid relay closed. Valve SHUT.', isResolved: false,
  },
  {
    id: 'demo_l2', time: '2 mins ago', deviceName: 'Smart Main Shutoff Valve',
    zone: 'Underground Sump', severity: 'CRITICAL',
    title: 'Contamination Source: Underground Sump (Confidence 91%)',
    message: 'Cross-node correlation: Sump flow spike without corresponding RO/Tank increase. Source isolated to Sump Inlet pipe.',
    actionTaken: 'Contamination zone isolated.', isResolved: false,
  },
  ...NORMAL_ALERTS,
];

const PH_DROP_ALERTS: HomeAlert[] = [
  {
    id: 'demo_p1', time: 'Just now', deviceName: 'Kitchen RO Purifier',
    zone: 'Kitchen RO Purifier', severity: 'CRITICAL',
    title: 'CRITICAL: pH Drop Below Safe Limit',
    message: 'RO outlet pH is 5.9 (safe: 6.5–8.5). Acidic water detected. DO NOT DRINK.',
    actionTaken: 'Potable water alert triggered. Valve monitoring active.', isResolved: false,
  },
  {
    id: 'demo_p2', time: '4 mins ago', deviceName: 'Bathroom Softener Unit',
    zone: 'Bathroom Supply', severity: 'WARNING',
    title: 'Low pH in Bathroom Supply',
    message: 'Bathroom supply pH at 6.1. Possible acid flush from municipal treatment.',
    actionTaken: 'Logged. Cross-zone correlation initiated.', isResolved: false,
  },
  ...NORMAL_ALERTS,
];

const TURBIDITY_ALERTS: HomeAlert[] = [
  {
    id: 'demo_r1', time: 'Just now', deviceName: 'Smart Main Shutoff Valve',
    zone: 'Underground Sump', severity: 'WARNING',
    title: 'High Turbidity — Post-Rain Sediment Influx',
    message: 'Sump inlet turbidity at 4.2 NTU. Post-rainfall sediment detected in municipal supply.',
    actionTaken: 'Auto-backwash initiated. Sediment filter active.', isResolved: false,
  },
  {
    id: 'demo_r2', time: '3 mins ago', deviceName: 'Overhead Roof Tank Sensor',
    zone: 'Overhead Roof Tank', severity: 'WARNING',
    title: 'Tank Water Cloudiness Elevated',
    message: 'Tank turbidity reached 3.1 NTU. Sediment settling in progress.',
    actionTaken: 'Logged. Allow 30 min settling time.', isResolved: false,
  },
  {
    id: 'demo_r3', time: '10 mins ago', deviceName: 'Contamination Source Engine',
    zone: 'Underground Sump', severity: 'INFO',
    title: 'Contamination Source: Municipal Supply (Confidence 78%)',
    message: 'Turbidity spike correlates across Sump → Tank → Bathroom. Source identified as upstream municipal supply.',
    actionTaken: 'All zones flagged for monitoring.', isResolved: false,
  },
  ...NORMAL_ALERTS,
];

// ─── AI Insights per scenario ────────────────────────────────────────────────

const NORMAL_AI: HomeAIInsight = {
  waterClassification: 'SAFE', purityScore: 99,
  safeForDrinking: true, safeForCooking: true, safeForBabyFormula: true, safeForBathing: true,
  reasoning: 'Kitchen RO TDS is 85 ppm with near-zero turbidity (0.20 NTU) and optimal pH 7.2. Water quality is excellent across all zones.',
  recommendedActions: [
    'Order UV Lamp replacement — 12 days remaining.',
    'Roof tank healthy at 85% capacity.',
    'Daily consumption 320 L is within 400 L target.',
  ],
};

const HIGH_TDS_AI: HomeAIInsight = {
  waterClassification: 'BORDERLINE', purityScore: 68,
  safeForDrinking: false, safeForCooking: true, safeForBabyFormula: false, safeForBathing: true,
  reasoning: 'RO outlet TDS has risen to 248 ppm, exceeding the 150 ppm drinking threshold. Pre-carbon or RO membrane may be saturated. Not recommended for drinking until filter replacement.',
  recommendedActions: [
    'Immediately order RO Membrane replacement.',
    'Avoid using RO water for drinking and baby formula.',
    'Backwash pre-carbon filter to check if TDS normalizes.',
    'Roof tank TDS also elevated (315 ppm) — possible municipal supply issue.',
  ],
};

const PIPE_LEAK_AI: HomeAIInsight = {
  waterClassification: 'HAZARDOUS', purityScore: 12,
  safeForDrinking: false, safeForCooking: false, safeForBabyFormula: false, safeForBathing: false,
  reasoning: 'EMERGENCY: 14.8 L/min flow spike detected in Sump Inlet. Main solenoid valve has been automatically closed to prevent flooding. Cross-node analysis isolates the leak to the underground sump inlet pipe segment.',
  recommendedActions: [
    'DO NOT open main shutoff valve until pipe inspection is complete.',
    'Contact a licensed plumber immediately.',
    'Check sump pit for water accumulation.',
    'Once repaired, re-open valve from Settings → Valve Control.',
  ],
};

const PH_DROP_AI: HomeAIInsight = {
  waterClassification: 'UNSAFE', purityScore: 31,
  safeForDrinking: false, safeForCooking: false, safeForBabyFormula: false, safeForBathing: true,
  reasoning: 'Kitchen RO outlet pH is critically low at 5.9. Acidic water (< 6.5 pH) can leach heavy metals from pipes. The pH anomaly is visible across multiple zones suggesting a municipal supply issue or RO post-carbon failure.',
  recommendedActions: [
    'Do NOT drink or cook with current water supply.',
    'Contact municipal water authority to report pH anomaly.',
    'Replace RO post-carbon filter if municipal pH normalizes but RO pH remains low.',
    'Use stored bottled water until cleared.',
  ],
};

const TURBIDITY_AI: HomeAIInsight = {
  waterClassification: 'BORDERLINE', purityScore: 55,
  safeForDrinking: false, safeForCooking: false, safeForBabyFormula: false, safeForBathing: true,
  reasoning: 'Post-rain sediment influx has elevated turbidity across all zones (4.2 NTU at Sump, 3.1 NTU at Tank). RO pre-filter is reducing turbidity at the kitchen outlet (0.9 NTU). Allow 30–60 minutes for settling before resuming normal use.',
  recommendedActions: [
    'Allow 30 minutes for sediment to settle in storage tank.',
    'Sediment filter is actively handling influx — monitor health.',
    'Run backwash cycle when turbidity drops below 1.5 NTU.',
    'Check sediment filter health — may need early replacement after this event.',
  ],
};

// ─── Demo Scenarios Registry ──────────────────────────────────────────────────

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: 'NORMAL_DAY', label: 'Normal Day', emoji: '✅',
    description: 'All zones operating within safe thresholds. Typical weekday usage pattern.',
    devices: NORMAL_DAY_DEVICES, alerts: NORMAL_ALERTS,
    tankInfo: { tankCapacityLiters: 1000, currentLevelPercent: 85, currentLiters: 850, pumpState: 'AUTO', estimatedFullTime: 'Tank 85% Full (Pump Auto-Off)' },
    usageStats: { todayLiters: 320, weeklyAvgLiters: 345, targetDailyLimitLiters: 400, usageTrend: 'NORMAL' },
    aiInsight: NORMAL_AI,
  },
  {
    name: 'HIGH_TDS_EVENT', label: 'High TDS Alert', emoji: '⚠️',
    description: 'TDS spike detected in RO outlet and roof tank. Filter inspection required.',
    devices: HIGH_TDS_DEVICES, alerts: HIGH_TDS_ALERTS,
    tankInfo: { tankCapacityLiters: 1000, currentLevelPercent: 72, currentLiters: 720, pumpState: 'PUMPING', estimatedFullTime: 'Est. 45 mins to 80%' },
    usageStats: { todayLiters: 380, weeklyAvgLiters: 355, targetDailyLimitLiters: 400, usageTrend: 'ELEVATED' },
    aiInsight: HIGH_TDS_AI,
  },
  {
    name: 'PIPE_LEAK_EMERGENCY', label: 'Pipe Leak Emergency', emoji: '🚨',
    description: 'Emergency pipe burst detected. Main valve auto-closed. Immediate action required.',
    devices: PIPE_LEAK_DEVICES, alerts: PIPE_LEAK_ALERTS,
    tankInfo: { tankCapacityLiters: 1000, currentLevelPercent: 45, currentLiters: 450, pumpState: 'OFF', estimatedFullTime: 'Pump halted — leak in progress' },
    usageStats: { todayLiters: 520, weeklyAvgLiters: 370, targetDailyLimitLiters: 400, usageTrend: 'ELEVATED' },
    aiInsight: PIPE_LEAK_AI,
  },
  {
    name: 'PH_DROP_ANOMALY', label: 'pH Drop Anomaly', emoji: '🧪',
    description: 'Acidic pH (5.9) detected at RO outlet. Water unsafe for consumption.',
    devices: PH_DROP_DEVICES, alerts: PH_DROP_ALERTS,
    tankInfo: { tankCapacityLiters: 1000, currentLevelPercent: 80, currentLiters: 800, pumpState: 'AUTO', estimatedFullTime: 'Tank 80% Full' },
    usageStats: { todayLiters: 180, weeklyAvgLiters: 340, targetDailyLimitLiters: 400, usageTrend: 'SAVING' },
    aiInsight: PH_DROP_AI,
  },
  {
    name: 'POST_RAIN_TURBIDITY', label: 'Post-Rain Turbidity', emoji: '🌧️',
    description: 'Municipal supply turbidity spiked after heavy rain. Sediment influx across all zones.',
    devices: POST_RAIN_DEVICES, alerts: TURBIDITY_ALERTS,
    tankInfo: { tankCapacityLiters: 1000, currentLevelPercent: 93, currentLiters: 930, pumpState: 'AUTO', estimatedFullTime: 'Tank 93% Full — Near Capacity' },
    usageStats: { todayLiters: 290, weeklyAvgLiters: 330, targetDailyLimitLiters: 400, usageTrend: 'NORMAL' },
    aiInsight: TURBIDITY_AI,
  },
];

// ─── 14-Day Filter Load History (per filter) ──────────────────────────────────

function generateFilterHistory(
  baseTds: number, baseTurbidity: number, baseFlow: number, noiseScale = 1.0
): FilterDayLoad[] {
  return Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 13 - i;
    const date = new Date(Date.now() - daysAgo * 86_400_000).toISOString().split('T')[0];
    const weekendBoost = [5, 6].includes(new Date(date).getDay()) ? 1.15 : 1.0;
    return {
      date,
      avgTds: parseFloat((baseTds * weekendBoost + (Math.random() - 0.5) * 10 * noiseScale).toFixed(1)),
      avgTurbidity: parseFloat((baseTurbidity + (Math.random() * 0.2 - 0.1) * noiseScale).toFixed(2)),
      avgFlowLiters: parseFloat((baseFlow * weekendBoost + (Math.random() * 20 - 10) * noiseScale).toFixed(1)),
    };
  });
}

export const DEMO_FILTER_HISTORY: Record<string, FilterDayLoad[]> = {
  f1: generateFilterHistory(215, 1.3, 340, 1.2),   // Sediment — high load
  f2: generateFilterHistory(185, 0.8, 340, 0.9),   // Pre-Carbon — moderate
  f3: generateFilterHistory(90,  0.2, 280, 0.6),   // RO Membrane — low (clean output)
  f4: generateFilterHistory(85,  0.2, 280, 0.5),   // UV Lamp — very stable
};

// ─── Weekly Usage Simulation ──────────────────────────────────────────────────

export const DEMO_WEEKLY_USAGE = [
  { label: 'Mon', liters: 310, target: 400 },
  { label: 'Tue', liters: 345, target: 400 },
  { label: 'Wed', liters: 290, target: 400 },
  { label: 'Thu', liters: 370, target: 400 },
  { label: 'Fri', liters: 355, target: 400 },
  { label: 'Sat', liters: 420, target: 400 },
  { label: 'Sun', liters: 395, target: 400 },
];

// ─── Demo Contamination Events (for Novelty 3 preview) ────────────────────────

export const DEMO_CONTAMINATION_EVENTS = [
  {
    id: 'ctam_1', timestamp: ts(2), confidence: 91,
    sourceZone: 'Underground Sump' as const,
    affectedZones: ['Underground Sump', 'Overhead Roof Tank'] as const,
    evidenceRules: [
      { rule: 'Flow spike > 10 L/min in Sump only', nodeId: 'DEV-VALVE-03', metric: 'flowRate', observedValue: 14.8, threshold: 10 },
      { rule: 'Tank and RO readings normal', nodeId: 'DEV-RO-01', metric: 'tds', observedValue: 85, threshold: 180 },
    ],
    recommendedAction: 'Inspect sump inlet pipe for burst or loose joint.',
  },
  {
    id: 'ctam_2', timestamp: ts(60), confidence: 78,
    sourceZone: 'Overhead Roof Tank' as const,
    affectedZones: ['Overhead Roof Tank', 'Bathroom Supply'] as const,
    evidenceRules: [
      { rule: 'Turbidity > 3 NTU in Tank and Bathroom', nodeId: 'DEV-TANK-02', metric: 'turbidity', observedValue: 3.1, threshold: 1.5 },
      { rule: 'Sump turbidity normal — tank is source', nodeId: 'DEV-VALVE-03', metric: 'turbidity', observedValue: 1.2, threshold: 1.5 },
    ],
    recommendedAction: 'Clean roof tank — possible algae or sediment growth.',
  },
];
