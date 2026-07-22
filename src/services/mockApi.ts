import {
  MOCK_USER,
  MOCK_HOME_DEVICES,
  MOCK_RO_FILTERS,
  MOCK_TANK_INFO,
  MOCK_USAGE_STATS,
  MOCK_HOME_AI,
  MOCK_HOME_ALERTS,
  MOCK_HOME_HISTORICAL,
} from '../constants/mockData';
import {
  UserProfile,
  SmartWaterDevice,
  ROFilterCartridge,
  TankLevelInfo,
  WaterUsageStats,
  HomeAIInsight,
  HomeAlert,
} from '../types';

const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async login(email?: string, password?: string): Promise<UserProfile> {
    await delay(400);
    return MOCK_USER;
  },

  async loginWithBiometrics(): Promise<UserProfile> {
    await delay(300);
    return MOCK_USER;
  },

  async loginWithGoogle(): Promise<UserProfile> {
    await delay(400);
    return MOCK_USER;
  },

  async fetchHomeDevices(): Promise<SmartWaterDevice[]> {
    await delay(250);
    return MOCK_HOME_DEVICES;
  },

  async fetchDeviceDetails(deviceId: string): Promise<SmartWaterDevice | null> {
    await delay(200);
    return MOCK_HOME_DEVICES.find((d) => d.id === deviceId) || MOCK_HOME_DEVICES[0];
  },

  async toggleSmartValve(deviceId: string, targetState: 'OPEN' | 'CLOSED'): Promise<SmartWaterDevice> {
    await delay(400);
    const dev = MOCK_HOME_DEVICES.find((d) => d.id === deviceId) || MOCK_HOME_DEVICES[0];
    dev.valveState = targetState;
    return { ...dev };
  },

  async fetchROFilters(): Promise<ROFilterCartridge[]> {
    await delay(250);
    return MOCK_RO_FILTERS;
  },

  async orderReplacementFilter(filterId: string): Promise<string> {
    await delay(500);
    const filter = MOCK_RO_FILTERS.find((f) => f.id === filterId);
    return `Order #AG-${Math.floor(10000 + Math.random() * 90000)} dispatched for ${filter?.name || 'RO Filter Kit'}. Estimated delivery in 2 business days.`;
  },

  async fetchTankInfo(): Promise<TankLevelInfo> {
    await delay(200);
    return MOCK_TANK_INFO;
  },

  async fetchUsageStats(): Promise<WaterUsageStats> {
    await delay(200);
    return MOCK_USAGE_STATS;
  },

  async fetchHomeAI(): Promise<HomeAIInsight> {
    await delay(300);
    return MOCK_HOME_AI;
  },

  async fetchHomeAlerts(): Promise<HomeAlert[]> {
    await delay(250);
    return MOCK_HOME_ALERTS;
  },

  async fetchAlerts(): Promise<HomeAlert[]> {
    return this.fetchHomeAlerts();
  },

  async fetchAIInsights(): Promise<HomeAIInsight> {
    return this.fetchHomeAI();
  },

  async resolveAlert(alertId: string): Promise<HomeAlert[]> {
    await delay(300);
    const alert = MOCK_HOME_ALERTS.find((a) => a.id === alertId);
    if (alert) {
      alert.isResolved = true;
      alert.actionTaken = 'Acknowledged & Resolved by Home Owner';
    }
    return [...MOCK_HOME_ALERTS];
  },

  async fetchHistoricalData(period: 'daily' | 'weekly' | 'monthly') {
    await delay(250);
    return MOCK_HOME_HISTORICAL[period];
  },
};
