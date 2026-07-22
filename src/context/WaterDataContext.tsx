import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SmartWaterDevice,
  ROFilterCartridge,
  TankLevelInfo,
  WaterUsageStats,
  SensorReading,
  ConnectionStatus,
} from '../types';
import { mockApi } from '../services/mockApi';
import { mqttSimulator } from '../services/mqttSimulator';

interface WaterDataContextType {
  devices: SmartWaterDevice[];
  filters: ROFilterCartridge[];
  tankInfo: TankLevelInfo | null;
  usageStats: WaterUsageStats | null;
  liveReading: SensorReading;
  connectionStatus: ConnectionStatus;
  isLiveUpdating: boolean;
  setIsLiveUpdating: (active: boolean) => void;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const WaterDataContext = createContext<WaterDataContextType | undefined>(undefined);

export const WaterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<SmartWaterDevice[]>([]);
  const [filters, setFilters] = useState<ROFilterCartridge[]>([]);
  const [tankInfo, setTankInfo] = useState<TankLevelInfo | null>(null);
  const [usageStats, setUsageStats] = useState<WaterUsageStats | null>(null);
  const [liveReading, setLiveReading] = useState<SensorReading>(mqttSimulator.getLatestReading());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(mqttSimulator.getStatus());
  const [isLiveUpdating, setIsLiveUpdatingState] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const devs = await mockApi.fetchHomeDevices();
      setDevices(devs);
      const filts = await mockApi.fetchROFilters();
      setFilters(filts);
      const tInfo = await mockApi.fetchTankInfo();
      setTankInfo(tInfo);
      const uStats = await mockApi.fetchUsageStats();
      setUsageStats(uStats);
    } catch (err) {
      console.error('Failed loading home water data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (!isLiveUpdating) return;

    mqttSimulator.start();

    const unsubscribeTelemetry = mqttSimulator.subscribeTelemetry((reading) => {
      setLiveReading(reading);
      setDevices((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          readings: reading,
          lastSeen: 'Just now',
        };
        return updated;
      });
    });

    const unsubscribeStatus = mqttSimulator.subscribeStatus((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubscribeTelemetry();
      unsubscribeStatus();
    };
  }, [isLiveUpdating]);

  const setIsLiveUpdating = (active: boolean) => {
    setIsLiveUpdatingState(active);
    if (!active) {
      mqttSimulator.stop();
    } else {
      mqttSimulator.start();
    }
  };

  return (
    <WaterDataContext.Provider
      value={{
        devices,
        filters,
        tankInfo,
        usageStats,
        liveReading,
        connectionStatus,
        isLiveUpdating,
        setIsLiveUpdating,
        refreshData: loadAllData,
        isLoading,
      }}
    >
      {children}
    </WaterDataContext.Provider>
  );
};

export const useWaterDataContext = () => {
  const context = useContext(WaterDataContext);
  if (!context) {
    throw new Error('useWaterDataContext must be used within a WaterDataProvider');
  }
  return context;
};
