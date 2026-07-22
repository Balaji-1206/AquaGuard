import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemAlert } from '../types';
import { mockApi } from '../services/mockApi';

interface NotificationContextType {
  alerts: SystemAlert[];
  unresolvedCount: number;
  resolveAlert: (id: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAlertsList = async () => {
    try {
      setIsLoading(true);
      const data = await mockApi.fetchAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsList();
  }, []);

  const resolveAlert = async (id: string) => {
    const updated = await mockApi.resolveAlert(id);
    setAlerts(updated);
  };

  const unresolvedCount = alerts.filter((a) => !a.isResolved).length;

  return (
    <NotificationContext.Provider
      value={{
        alerts,
        unresolvedCount,
        resolveAlert,
        refreshAlerts: fetchAlertsList,
        isLoading,
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
