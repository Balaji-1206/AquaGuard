import { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Severity } from '../types';

export const useAlerts = () => {
  const { alerts, unresolvedCount, resolveAlert, refreshAlerts, isLoading } = useNotifications();
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity === 'ALL') return true;
    return a.severity === selectedSeverity;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && !a.isResolved).length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && !a.isResolved).length;

  return {
    alerts: filteredAlerts,
    unresolvedCount,
    criticalCount,
    warningCount,
    selectedSeverity,
    setSelectedSeverity,
    resolveAlert,
    refreshAlerts,
    isLoading,
  };
};
