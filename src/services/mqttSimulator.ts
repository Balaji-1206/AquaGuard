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

  public start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Micro fluctuations in Kitchen RO sensors
      const phDelta = (Math.random() - 0.5) * 0.04;
      const tdsDelta = Math.floor((Math.random() - 0.5) * 2);
      const tempDelta = (Math.random() - 0.5) * 0.1;

      this.currentReading = {
        pH: parseFloat(Math.max(6.8, Math.min(7.6, this.currentReading.pH + phDelta)).toFixed(2)),
        tds: Math.max(70, Math.min(110, this.currentReading.tds + tdsDelta)),
        temperature: parseFloat(Math.max(20.0, Math.min(30.0, this.currentReading.temperature + tempDelta)).toFixed(1)),
        turbidity: 0.2,
        flowRate: 1.8,
        timestamp: new Date().toISOString(),
      };

      this.currentStatus = {
        ...this.currentStatus,
        lastSynced: 'Just now',
      };

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
