/**
 * AquaGuard Production API Client
 * Provides HTTP REST & WebSocket integration for live backend connection.
 */

import { SmartWaterDevice, HomeAlert, SensorReading } from '../types';

export interface BackendConfig {
  baseUrl: string;
  wsUrl: string;
  useLiveBackend: boolean;
}

export const defaultConfig: BackendConfig = {
  baseUrl: 'http://localhost:5000/api',
  wsUrl: typeof window !== 'undefined' && window.location ? `ws://${window.location.hostname}:5000` : 'ws://172.16.10.38:5000',
  useLiveBackend: true, // Connected to live backend server
};

class AquaGuardApiClient {
  private config: BackendConfig = { ...defaultConfig };
  private ws: WebSocket | null = null;
  private telemetryCallbacks: Set<(reading: SensorReading) => void> = new Set();
  private alertCallbacks: Set<(alerts: HomeAlert[]) => void> = new Set();

  public configure(newConfig: Partial<BackendConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.config.useLiveBackend) {
      this.initWebSocket();
    }
  }

  // Connect to Live WebSocket Server
  public initWebSocket(): void {
    if (this.ws) return;

    try {
      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.onopen = () => {
        console.log('⚡ AquaGuard App connected to Live Backend WebSocket Stream');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'TELEMETRY_UPDATE' && data.reading) {
            this.telemetryCallbacks.forEach((cb) => cb(data.reading));
          }
          if (data.type === 'TELEMETRY_UPDATE' && data.newAlerts?.length > 0) {
            this.fetchAlerts().then((alerts) => {
              this.alertCallbacks.forEach((cb) => cb(alerts));
            });
          }
        } catch (err) {
          console.error('WebSocket parse error:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed. Reconnecting in 5s...');
        this.ws = null;
        setTimeout(() => this.initWebSocket(), 5000);
      };
    } catch (e) {
      console.error('Failed creating WebSocket:', e);
    }
  }

  // HTTP REST API Calls
  public async fetchDevices(): Promise<SmartWaterDevice[]> {
    const res = await fetch(`${this.config.baseUrl}/devices`);
    if (!res.ok) throw new Error('Failed fetching devices');
    return res.json();
  }

  public async fetchAlerts(): Promise<HomeAlert[]> {
    const res = await fetch(`${this.config.baseUrl}/alerts`);
    if (!res.ok) throw new Error('Failed fetching alerts');
    return res.json();
  }

  public async resolveAlert(alertId: string): Promise<HomeAlert[]> {
    const res = await fetch(`${this.config.baseUrl}/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed resolving alert');
    return res.json();
  }

  public async resolveAllAlerts(): Promise<HomeAlert[]> {
    const res = await fetch(`${this.config.baseUrl}/alerts/resolve-all`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed batch resolving alerts');
    return res.json();
  }

  public async toggleValve(deviceId: string, targetState: 'OPEN' | 'CLOSED'): Promise<SmartWaterDevice> {
    const res = await fetch(`${this.config.baseUrl}/valves/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, targetState }),
    });
    if (!res.ok) throw new Error('Failed commanding valve');
    const data = await res.json();
    return data.device;
  }

  // Subscribe to real-time events
  public subscribeTelemetry(callback: (reading: SensorReading) => void): () => void {
    this.telemetryCallbacks.add(callback);
    return () => this.telemetryCallbacks.delete(callback);
  }

  public subscribeAlerts(callback: (alerts: HomeAlert[]) => void): () => void {
    this.alertCallbacks.add(callback);
    return () => this.alertCallbacks.delete(callback);
  }
}

export const apiClient = new AquaGuardApiClient();
