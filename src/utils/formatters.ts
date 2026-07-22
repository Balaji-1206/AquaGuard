export const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatRssiToSignal = (rssi: number): { label: string; percentage: number; color: string } => {
  if (rssi >= -60) return { label: 'Excellent', percentage: 100, color: '#2E7D32' };
  if (rssi >= -75) return { label: 'Good', percentage: 75, color: '#26A69A' };
  if (rssi >= -85) return { label: 'Fair', percentage: 50, color: '#F9A825' };
  return { label: 'Poor', percentage: 25, color: '#D32F2F' };
};

export const formatBatteryColor = (level: number): string => {
  if (level > 60) return '#2E7D32';
  if (level > 20) return '#F9A825';
  return '#D32F2F';
};
