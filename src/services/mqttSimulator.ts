import { SensorReading, ConnectionStatus } from '../types';

type TelemetryCallback = (reading: SensorReading) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class MqttSimulatorService {
  private telemetrySubscribers: Set<TelemetryCallback> = new Set();
  private statusSubscribers: Set<StatusCallback> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private currentReading: SensorReading = {
    pH: 7.2,
    tds: 85,
    temperature: 24.5,
    turbidity: 0.2,
    flowRate: 1.8,
    timestamp: new Date().toISOString(),
  };

  private currentStatus: ConnectionStatus = {
    mqttStatus: 'CONNECTED',
    esp32Status: 'ONLINE',
    batteryStatus: 100,
    internetStatus: true,
    lastSynced: 'Just now',
  };

  // ─── Scenario presets for Demo Mode ───────────────────────────────────────
  private readonly SCENARIO_PRESETS: Record<string, Partial<SensorReading>> = {
    NORMAL_DAY:           { pH: 7.2, tds: 85,  temperature: 24.5, turbidity: 0.20, flowRate: 1.8 },
    HIGH_TDS_EVENT:       { pH: 7.0, tds: 248, temperature: 25.0, turbidity: 0.60, flowRate: 1.9 },
    PIPE_LEAK_EMERGENCY:  { pH: 7.3, tds: 225, temperature: 26.0, turbidity: 1.40, flowRate: 14.8 },
    PH_DROP_ANOMALY:      { pH: 5.9, tds: 92,  temperature: 24.8, turbidity: 0.80, flowRate: 1.7 },
    POST_RAIN_TURBIDITY:  { pH: 7.1, tds: 95,  temperature: 23.5, turbidity: 4.20, flowRate: 2.1 },
  };

  public start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Micro fluctuations around current reading
      const phDelta   = (Math.random() - 0.5) * 0.04;
      const tdsDelta  = Math.floor((Math.random() - 0.5) * 2);
      const tempDelta = (Math.random() - 0.5) * 0.1;

      this.currentReading = {
        pH:          parseFloat(Math.max(4.0, Math.min(9.5, this.currentReading.pH + phDelta)).toFixed(2)),
        tds:         Math.max(0, Math.min(999, this.currentReading.tds + tdsDelta)),
        temperature: parseFloat(Math.max(15.0, Math.min(40.0, this.currentReading.temperature + tempDelta)).toFixed(1)),
        turbidity:   parseFloat(Math.max(0, this.currentReading.turbidity + (Math.random() - 0.5) * 0.03).toFixed(2)),
        flowRate:    parseFloat(Math.max(0, this.currentReading.flowRate + (Math.random() - 0.5) * 0.05).toFixed(1)),
        timestamp:   new Date().toISOString(),
      };

      this.currentStatus = { ...this.currentStatus, lastSynced: 'Just now' };

      this.telemetrySubscribers.forEach((cb) => cb(this.currentReading));
      this.statusSubscribers.forEach((cb) => cb(this.currentStatus));
    }, 3000);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /** Set a named demo scenario as the base reading */
  public setScenario(scenarioName: string): void {
    const preset = this.SCENARIO_PRESETS[scenarioName];
    if (preset) {
      this.currentReading = { ...this.currentReading, ...preset, timestamp: new Date().toISOString() };
      this.telemetrySubscribers.forEach((cb) => cb(this.currentReading));
    }
  }

  /** Directly inject a specific reading (used by demoDataService) */
  public injectReading(reading: SensorReading): void {
    this.currentReading = { ...reading, timestamp: new Date().toISOString() };
    this.telemetrySubscribers.forEach((cb) => cb(this.currentReading));
    this.statusSubscribers.forEach((cb) => cb(this.currentStatus));
  }

  /** Inject a one-off anomaly spike, then revert after delayMs */
  public simulateAnomalyEvent(
    type: 'FLOW_SPIKE' | 'TDS_SPIKE' | 'PH_DROP' | 'TURBIDITY_SPIKE',
    delayMs: number = 8000
  ): void {
    const savedReading = { ...this.currentReading };

    const anomalyMap: Record<string, Partial<SensorReading>> = {
      FLOW_SPIKE:       { flowRate: 14.8 },
      TDS_SPIKE:        { tds: 295 },
      PH_DROP:          { pH: 5.7 },
      TURBIDITY_SPIKE:  { turbidity: 4.8 },
    };

    const anomaly = { ...this.currentReading, ...anomalyMap[type], timestamp: new Date().toISOString() };
    this.currentReading = anomaly;
    this.telemetrySubscribers.forEach((cb) => cb(this.currentReading));

    // Revert after delay
    setTimeout(() => {
      this.currentReading = { ...savedReading, timestamp: new Date().toISOString() };
      this.telemetrySubscribers.forEach((cb) => cb(this.currentReading));
    }, delayMs);
  }

  public subscribeTelemetry(callback: TelemetryCallback): () => void {
    this.telemetrySubscribers.add(callback);
    callback(this.currentReading);
    return () => this.telemetrySubscribers.delete(callback);
  }

  public subscribeStatus(callback: StatusCallback): () => void {
    this.statusSubscribers.add(callback);
    callback(this.currentStatus);
    return () => this.statusSubscribers.delete(callback);
  }

  public getLatestReading(): SensorReading {
    return this.currentReading;
  }

  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }
}

export const mqttSimulator = new MqttSimulatorService();
