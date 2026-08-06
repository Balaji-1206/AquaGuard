/**
 * AquaGuard Demo Data Service
 * ============================
 * Detects backend connectivity and falls back to rich demo scenarios
 * when no ESP32 or server is reachable. Integrates with mqttSimulator
 * to inject demo sensor readings into the existing data stream.
 */

import { DemoScenarioName, SensorReading, SmartWaterDevice, HomeAlert, TankLevelInfo, WaterUsageStats, HomeAIInsight } from '../types';
import { DEMO_SCENARIOS, DemoScenario, DEMO_HOURLY_READINGS } from '../constants/demoMockData';
import { mqttSimulator } from './mqttSimulator';

const BACKEND_HEALTH_URL = 'http://localhost:5000/health';
const CONNECTIVITY_TIMEOUT_MS = 2000;

class DemoDataServiceClass {
  private _isDemo: boolean = true;
  private _currentScenarioName: DemoScenarioName = 'NORMAL_DAY';
  private _currentHourIndex: number = new Date().getHours();
  private _diurnalIntervalId: ReturnType<typeof setInterval> | null = null;
  private _onScenarioChange: ((s: DemoScenario) => void) | null = null;

  // ─── Connectivity Check ────────────────────────────────────────────────────

  /** Ping the backend health endpoint. Returns true if reachable. */
  async checkBackendConnectivity(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CONNECTIVITY_TIMEOUT_MS);
      const response = await fetch(BACKEND_HEALTH_URL, { signal: controller.signal });
      clearTimeout(timer);
      this._isDemo = !response.ok;
      return response.ok;
    } catch {
      this._isDemo = true;
      return false;
    }
  }

  get isDemo(): boolean {
    return this._isDemo;
  }

  // ─── Scenario Management ───────────────────────────────────────────────────

  get currentScenarioName(): DemoScenarioName {
    return this._currentScenarioName;
  }

  getCurrentScenario(): DemoScenario {
    return DEMO_SCENARIOS.find((s) => s.name === this._currentScenarioName) ?? DEMO_SCENARIOS[0];
  }

  setScenario(scenarioName: DemoScenarioName): void {
    this._currentScenarioName = scenarioName;
    const scenario = this.getCurrentScenario();

    // Push the scenario's primary device reading into the MQTT simulator
    const primaryDevice = scenario.devices.find((d) => d.id === 'DEV-RO-01');
    if (primaryDevice) {
      mqttSimulator.injectReading(primaryDevice.readings);
    }

    this._onScenarioChange?.(scenario);
  }

  onScenarioChange(cb: (s: DemoScenario) => void): void {
    this._onScenarioChange = cb;
  }

  // ─── Diurnal Cycle ────────────────────────────────────────────────────────

  /** Advances through 24-hour sensor readings one step every 15 seconds in demo mode */
  startDiurnalCycle(): void {
    if (this._diurnalIntervalId) return;
    this._diurnalIntervalId = setInterval(() => {
      if (!this._isDemo) return;
      this._currentHourIndex = (this._currentHourIndex + 1) % 24;
      const hourlyReading = DEMO_HOURLY_READINGS[this._currentHourIndex];
      mqttSimulator.injectReading(hourlyReading);
    }, 15_000);
  }

  stopDiurnalCycle(): void {
    if (this._diurnalIntervalId) {
      clearInterval(this._diurnalIntervalId);
      this._diurnalIntervalId = null;
    }
  }

  // ─── Anomaly Injection ────────────────────────────────────────────────────

  /** Inject a one-off sensor spike event for demonstration */
  simulateAnomalyEvent(type: 'FLOW_SPIKE' | 'TDS_SPIKE' | 'PH_DROP' | 'TURBIDITY_SPIKE'): SensorReading {
    const base = mqttSimulator.getLatestReading();
    let anomaly: SensorReading;

    switch (type) {
      case 'FLOW_SPIKE':
        anomaly = { ...base, flowRate: 14.8, timestamp: new Date().toISOString() };
        break;
      case 'TDS_SPIKE':
        anomaly = { ...base, tds: 280, timestamp: new Date().toISOString() };
        break;
      case 'PH_DROP':
        anomaly = { ...base, pH: 5.8, timestamp: new Date().toISOString() };
        break;
      case 'TURBIDITY_SPIKE':
        anomaly = { ...base, turbidity: 4.5, timestamp: new Date().toISOString() };
        break;
    }

    mqttSimulator.injectReading(anomaly);
    return anomaly;
  }

  // ─── Scenario Accessors ────────────────────────────────────────────────────

  getDevices(): SmartWaterDevice[]  { return this.getCurrentScenario().devices; }
  getAlerts():  HomeAlert[]         { return this.getCurrentScenario().alerts; }
  getTankInfo(): TankLevelInfo      { return this.getCurrentScenario().tankInfo; }
  getUsageStats(): WaterUsageStats  { return this.getCurrentScenario().usageStats; }
  getAIInsight(): HomeAIInsight     { return this.getCurrentScenario().aiInsight; }
  getAllScenarios(): DemoScenario[]  { return DEMO_SCENARIOS; }
}

export const demoDataService = new DemoDataServiceClass();
