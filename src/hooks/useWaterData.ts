import { useWaterDataContext } from '../context/WaterDataContext';
import { classifyHomeWaterQuality } from '../utils/waterQuality';

export const useWaterData = () => {
  const {
    devices,
    filters,
    tankInfo,
    usageStats,
    liveReading,
    connectionStatus,
    isLiveUpdating,
    setIsLiveUpdating,
    refreshData,
    isLoading,
  } = useWaterDataContext();

  const qualityAnalysis = classifyHomeWaterQuality(liveReading);

  return {
    devices,
    filters,
    tankInfo,
    usageStats,
    liveReading,
    qualityAnalysis,
    connectionStatus,
    isLiveUpdating,
    setIsLiveUpdating,
    refreshData,
    isLoading,
  };
};
