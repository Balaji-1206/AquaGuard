import { useState } from 'react';
import { useWaterDataContext } from '../context/WaterDataContext';
import { SmartWaterDevice } from '../types';

export const useNodes = () => {
  const { devices, isLoading, refreshData } = useWaterDataContext();
  const [filterZone, setFilterZone] = useState<string>('ALL');

  const filteredDevices = devices.filter((d: SmartWaterDevice) => {
    if (filterZone === 'ALL') return true;
    return d.zone === filterZone;
  });

  const onlineCount = devices.filter((d: SmartWaterDevice) => d.status === 'ONLINE').length;
  const offlineCount = devices.filter((d: SmartWaterDevice) => d.status === 'OFFLINE').length;

  return {
    nodes: filteredDevices,
    devices: filteredDevices,
    totalCount: devices.length,
    onlineCount,
    offlineCount,
    filterZone,
    setFilterZone,
    isLoading,
    refreshNodes: refreshData,
  };
};

export const useDevices = useNodes;
