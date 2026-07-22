import {
  SmartWaterDevice,
  ROFilterCartridge,
  TankLevelInfo,
  WaterUsageStats,
  HomeAIInsight,
  HomeAlert,
  UserProfile,
} from '../types';

export const MOCK_USER: UserProfile = {
  id: 'usr_home_101',
  name: 'Balaji',
  email: 'balaji.home@aquaguard.io',
  phone: '+91 98765 43210',
  role: 'Home Owner',
  homeAddress: 'Villa 42, Palm Meadows, Chennai',
  assignedZones: ['Kitchen RO Purifier', 'Overhead Roof Tank', 'Underground Sump', 'Bathroom Supply'],
  filterSubscriptionActive: true,
};

export const MOCK_HOME_DEVICES: SmartWaterDevice[] = [
  {
    id: 'DEV-RO-01',
    name: 'Kitchen RO Purifier',
    zone: 'Kitchen RO Purifier',
    location: 'Main Kitchen Counter',
    status: 'ONLINE',
    battery: 100,
    wifiSignal: -52,
    lastSeen: 'Just now',
    waterStatus: 'SAFE',
    valveState: 'OPEN',
    readings: {
      pH: 7.2,
      tds: 85, // Ideal drinking TDS: 50-150 ppm
      temperature: 24.5,
      turbidity: 0.2,
      flowRate: 1.8,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'DEV-TANK-02',
    name: 'Overhead Roof Tank Sensor',
    zone: 'Overhead Roof Tank',
    location: 'Terrace Level 2 Tank',
    status: 'ONLINE',
    battery: 88,
    wifiSignal: -64,
    lastSeen: '2 mins ago',
    waterStatus: 'SAFE',
    valveState: 'OPEN',
    readings: {
      pH: 7.4,
      tds: 210,
      temperature: 27.8,
      turbidity: 1.1,
      flowRate: 0.0,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'DEV-VALVE-03',
    name: 'Smart Main Shutoff Valve',
    zone: 'Underground Sump',
    location: 'Sump Pump Inlet Valve',
    status: 'ONLINE',
    battery: 95,
    wifiSignal: -58,
    lastSeen: '1 min ago',
    waterStatus: 'SAFE',
    valveState: 'OPEN',
    readings: {
      pH: 7.3,
      tds: 220,
      temperature: 26.0,
      turbidity: 1.4,
      flowRate: 12.5,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'DEV-BATH-04',
    name: 'Bathroom Softener Unit',
    zone: 'Bathroom Supply',
    location: 'Master Bathroom Header',
    status: 'ONLINE',
    battery: 78,
    wifiSignal: -71,
    lastSeen: '5 mins ago',
    waterStatus: 'SAFE',
    valveState: 'OPEN',
    readings: {
      pH: 7.1,
      tds: 140,
      temperature: 28.2,
      turbidity: 0.5,
      flowRate: 4.2,
      timestamp: new Date().toISOString(),
    },
  },
];

export const MOCK_RO_FILTERS: ROFilterCartridge[] = [
  {
    id: 'f1',
    name: 'Sediment Filter Cartridge',
    type: 'Sediment',
    healthPercent: 78,
    daysRemaining: 45,
    lastReplacedDate: '2026-04-15',
    status: 'OPTIMAL',
  },
  {
    id: 'f2',
    name: 'Pre-Carbon Block Filter',
    type: 'Pre-Carbon',
    healthPercent: 62,
    daysRemaining: 30,
    lastReplacedDate: '2026-03-20',
    status: 'OPTIMAL',
  },
  {
    id: 'f3',
    name: 'High-Flow RO Membrane',
    type: 'RO Membrane',
    healthPercent: 90,
    daysRemaining: 180,
    lastReplacedDate: '2026-01-10',
    status: 'OPTIMAL',
  },
  {
    id: 'f4',
    name: 'UV Sterilization Lamp',
    type: 'UV Lamp',
    healthPercent: 22,
    daysRemaining: 12,
    lastReplacedDate: '2025-07-22',
    status: 'REPLACE_SOON',
  },
];

export const MOCK_TANK_INFO: TankLevelInfo = {
  tankCapacityLiters: 1000,
  currentLevelPercent: 85,
  currentLiters: 850,
  pumpState: 'AUTO',
  estimatedFullTime: 'Tank 85% Full (Pump Auto-Off)',
};

export const MOCK_USAGE_STATS: WaterUsageStats = {
  todayLiters: 320,
  weeklyAvgLiters: 345,
  targetDailyLimitLiters: 400,
  usageTrend: 'NORMAL',
};

export const MOCK_HOME_AI: HomeAIInsight = {
  waterClassification: 'SAFE',
  purityScore: 99,
  safeForDrinking: true,
  safeForCooking: true,
  safeForBabyFormula: true,
  safeForBathing: true,
  reasoning: 'Kitchen RO water TDS is 85 ppm with zero turbidity (0.2 NTU) and optimal pH (7.2). Water is crystal pure and ideal for household drinking and cooking.',
  recommendedActions: [
    'Order UV Lamp Replacement cartridge (12 days lifespan remaining).',
    'Roof tank water level is healthy at 85% (850 L).',
    'Daily consumption (320 L) is within your 400 L target.',
  ],
};

export const MOCK_HOME_ALERTS: HomeAlert[] = [
  {
    id: 'alt_h1',
    time: '20 mins ago',
    deviceName: 'Kitchen RO Purifier',
    zone: 'Kitchen RO Purifier',
    severity: 'WARNING',
    title: 'UV Lamp Lifespan Warning',
    message: 'UV Sterilization Lamp has reached 22% health (12 days remaining). Re-order replacement kit.',
    actionTaken: 'Auto-reorder reminder queued.',
    isResolved: false,
  },
  {
    id: 'alt_h2',
    time: '2 hours ago',
    deviceName: 'Overhead Roof Tank Sensor',
    zone: 'Overhead Roof Tank',
    severity: 'INFO',
    title: 'Roof Tank Full',
    message: 'Overhead tank reached 85% capacity. Sump pump auto-shutoff triggered.',
    actionTaken: 'Pump stopped automatically.',
    isResolved: true,
  },
  {
    id: 'alt_h3',
    time: 'Yesterday',
    deviceName: 'Kitchen RO Purifier',
    zone: 'Kitchen RO Purifier',
    severity: 'INFO',
    title: 'TDS Optimal Check',
    message: 'Kitchen RO purified water TDS registered at 85 ppm (ideal drinking range 50-150 ppm).',
    actionTaken: 'Logged to purity timeline.',
    isResolved: true,
  },
];

export const MOCK_HOME_HISTORICAL = {
  daily: [
    { label: '06 AM', pH: 7.1, tds: 82, turbidity: 0.2, temp: 24.0 },
    { label: '09 AM', pH: 7.2, tds: 85, turbidity: 0.2, temp: 24.5 },
    { label: '12 PM', pH: 7.3, tds: 88, turbidity: 0.3, temp: 25.5 },
    { label: '03 PM', pH: 7.2, tds: 86, turbidity: 0.2, temp: 26.0 },
    { label: '06 PM', pH: 7.4, tds: 84, turbidity: 0.2, temp: 25.0 },
    { label: '09 PM', pH: 7.1, tds: 83, turbidity: 0.2, temp: 24.2 },
  ],
  weekly: [
    { label: 'Mon', pH: 7.2, tds: 84, turbidity: 0.2, temp: 24.5 },
    { label: 'Tue', pH: 7.3, tds: 86, turbidity: 0.2, temp: 24.8 },
    { label: 'Wed', pH: 7.1, tds: 82, turbidity: 0.2, temp: 24.2 },
    { label: 'Thu', pH: 7.4, tds: 88, turbidity: 0.3, temp: 25.1 },
    { label: 'Fri', pH: 7.2, tds: 85, turbidity: 0.2, temp: 24.9 },
    { label: 'Sat', pH: 7.5, tds: 90, turbidity: 0.3, temp: 25.5 },
    { label: 'Sun', pH: 7.2, tds: 83, turbidity: 0.2, temp: 24.7 },
  ],
  monthly: [
    { label: 'Week 1', pH: 7.2, tds: 83, turbidity: 0.2, temp: 24.3 },
    { label: 'Week 2', pH: 7.3, tds: 86, turbidity: 0.3, temp: 25.0 },
    { label: 'Week 3', pH: 7.1, tds: 82, turbidity: 0.2, temp: 24.1 },
    { label: 'Week 4', pH: 7.4, tds: 87, turbidity: 0.3, temp: 25.4 },
  ],
};
