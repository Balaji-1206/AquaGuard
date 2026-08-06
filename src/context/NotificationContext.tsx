import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SystemAlert } from '../types';
import { mockApi } from '../services/mockApi';

interface NotificationContextType {
  alerts: SystemAlert[];
  unresolvedCount: number;
  criticalCount: number;
  resolveAlert: (id: string) => Promise<void>;
  resolveAllAlerts: () => Promise<void>;
  clearResolvedAlerts: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  isLoading: boolean;
  // Voice alert injection (called by VoiceAlertContext)
  setVoiceTriggerCallback: (cb: ((alert: SystemAlert) => void) | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const voiceTriggerCallback = useRef<((alert: SystemAlert) => void) | null>(null);
  const knownAlertIds = useRef<Set<string>>(new Set());

  const fetchAlertsList = async () => {
    try {
      setIsLoading(true);
      const data = await mockApi.fetchAlerts();
      setAlerts(data);
      // Seed known IDs on first load (don't speak existing alerts on startup)
      data.forEach((a) => knownAlertIds.current.add(a.id));
    } catch (err) {
      console.error('Failed fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsList();
  }, []);

  // When alerts change, check for new CRITICAL/WARNING alerts and trigger voice
  useEffect(() => {
    if (!voiceTriggerCallback.current) return;
    alerts.forEach((alert) => {
      if (knownAlertIds.current.has(alert.id)) return;
      if (alert.isResolved) return;
      if (alert.severity === 'CRITICAL' || alert.severity === 'WARNING') {
        voiceTriggerCallback.current!(alert);
      }
      knownAlertIds.current.add(alert.id);
    });
  }, [alerts]);

  const resolveAlert = async (id: string) => {
    const updated = await mockApi.resolveAlert(id);
    setAlerts(updated);
  };

  const resolveAllAlerts = async () => {
    const updated = await mockApi.resolveAllAlerts();
    setAlerts(updated);
  };

  const clearResolvedAlerts = async () => {
    const updated = await mockApi.clearResolvedAlerts();
    setAlerts(updated);
  };

  const setVoiceTriggerCallback = (cb: ((alert: SystemAlert) => void) | null) => {
    voiceTriggerCallback.current = cb;
  };

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;
  const criticalCount   = alerts.filter((a) => !a.isResolved && a.severity === 'CRITICAL').length;

  return (
    <NotificationContext.Provider
      value={{
        alerts,
        unresolvedCount,
        criticalCount,
        resolveAlert,
        resolveAllAlerts,
        clearResolvedAlerts,
        refreshAlerts: fetchAlertsList,
        isLoading,
        setVoiceTriggerCallback,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
