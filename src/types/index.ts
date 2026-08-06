// Domain Types for AquaGuard Smart Home Water Quality & RO Filter System

export type WaterQualityStatus = 'SAFE' | 'BORDERLINE' | 'UNSAFE' | 'HAZARDOUS';

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export type SensorType = 'pH' | 'TDS' | 'Temperature' | 'Turbidity' | 'Tank Level' | 'Flow Rate';

export type HomeZoneType = 'Kitchen RO Purifier' | 'Overhead Roof Tank' | 'Underground Sump' | 'Bathroom Supply';

export interface SensorReading {
  pH: number;
  tds: number; // in ppm (Ideal home drinking TDS: 50-150 ppm)
  temperature: number; // in °C
  turbidity: number; // in NTU
  flowRate: number; // in Liters per min (L/min)
  timestamp: string;
}

export interface ROFilterCartridge {
  id: string;
  name: string;
  type: 'Sediment' | 'Pre-Carbon' | 'RO Membrane' | 'UV Lamp' | 'Post-Carbon';
  healthPercent: number; // 0 - 100%
  daysRemaining: number;
  lastReplacedDate: string;
  status: 'OPTIMAL' | 'REPLACE_SOON' | 'EXPIRED';
}

export interface SmartWaterDevice {
  id: string;
  name: string;
  zone: HomeZoneType;
  location: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  battery: number;
  wifiSignal: number;
  lastSeen: string;
  readings: SensorReading;
  waterStatus: WaterQualityStatus;
  valveState: 'OPEN' | 'CLOSED';
}

export interface TankLevelInfo {
  tankCapacityLiters: number;
  currentLevelPercent: number; // e.g. 85%
  currentLiters: number;
  pumpState: 'OFF' | 'PUMPING' | 'AUTO';
  estimatedFullTime: string;
}

export interface WaterUsageStats {
  todayLiters: number;
  weeklyAvgLiters: number;
  targetDailyLimitLiters: number;
  usageTrend: 'NORMAL' | 'ELEVATED' | 'SAVING';
}

export interface HomeAIInsight {
  waterClassification: WaterQualityStatus;
  purityScore: number; // 0 - 100
  safeForDrinking: boolean;
  safeForCooking: boolean;
  safeForBabyFormula: boolean;
  safeForBathing: boolean;
  reasoning: string;
  recommendedActions: string[];
}

export interface HomeAlert {
  id: string;
  time: string;
  deviceName: string;
  zone: HomeZoneType;
  severity: Severity;
  title: string;
  message: string;
  actionTaken: string;
  isResolved: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Home Owner' | 'Family Admin' | 'Guest Member';
  homeAddress: string;
  assignedZones: string[];
  filterSubscriptionActive: boolean;
}

export interface ConnectionStatus {
  mqttStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  esp32Status: 'ONLINE' | 'OFFLINE';
  batteryStatus: number;
  internetStatus: boolean;
  lastSynced: string;
}

export type SystemAlert = HomeAlert;
export type AIInsightData = HomeAIInsight;

export interface AppSettings {
  apiUrl: string;
  mqttUrl: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notificationToggle: boolean;
  dataRefreshInterval: number;
  offlineMode: boolean;
}

// ─── Novelty 1: Filter Degradation Prediction ─────────────────────────────────

/** Daily load record for one filter — used by the regression engine */
export interface FilterDayLoad {
  date: string;           // ISO date string e.g. '2026-07-30'
  avgTds: number;         // average TDS through that filter that day (ppm)
  avgTurbidity: number;   // average turbidity (NTU)
  avgFlowLiters: number;  // total litres passed that day
}

/** Prediction output from the degradation engine */
export interface FilterPrediction {
  filterId: string;
  predictedDays: number;        // AI-forecast days remaining
  calendarDays: number;         // Original static calendar estimate
  confidencePercent: number;    // 0–100
  degradationTrend: 'ACCELERATING' | 'STABLE' | 'RECOVERING';
  dailyDegradationRate: number; // % health lost per day at current load
}

// ─── Novelty 3: Contamination Source Triangulation ────────────────────────────

/** One rule that fired during cross-node correlation */
export interface CorrelationEvidence {
  rule: string;        // human-readable rule description
  nodeId: string;      // which device triggered this
  metric: string;      // e.g. 'tds', 'turbidity'
  observedValue: number;
  threshold: number;
}

/** Result of a cross-node contamination correlation run */
export interface ContaminationSourceEvent {
  id: string;
  timestamp: string;
  sourceZone: HomeZoneType;
  affectedZones: HomeZoneType[];
  confidence: number;             // 0–100
  evidenceRules: CorrelationEvidence[];
  recommendedAction: string;
}

// ─── Demo Mode ────────────────────────────────────────────────────────────────

export type DemoScenarioName =
  | 'NORMAL_DAY'
  | 'HIGH_TDS_EVENT'
  | 'PIPE_LEAK_EMERGENCY'
  | 'PH_DROP_ANOMALY'
  | 'POST_RAIN_TURBIDITY';
