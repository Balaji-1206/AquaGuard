import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useWaterData } from '../../hooks/useWaterData';
import { useAppTheme } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { PuritySafetyCard } from '../../components/home/PuritySafetyCard';
import { FilterLifespanWidget } from '../../components/home/FilterLifespanWidget';
import { TankLevelCard } from '../../components/home/TankLevelCard';
import { WaterUsageCard } from '../../components/home/WaterUsageCard';
import { SensorCard } from '../../components/dashboard/SensorCard';
import { WaterCard } from '../../components/common/WaterCard';
import { Skeleton } from '../../components/common/Skeleton';
import { SENSOR_THRESHOLDS } from '../../constants/thresholds';
import { Typography, Spacing } from '../../theme';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const {
    filters,
    tankInfo,
    usageStats,
    liveReading,
    qualityAnalysis,
    refreshData,
    isLoading,
  } = useWaterData();
  const { theme } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Header onNotificationPress={() => navigation.navigate('AlertsTimeline')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Main Hero Purity Banner */}
        {isLoading ? (
          <Skeleton height={170} borderRadius={24} />
        ) : (
          <PuritySafetyCard
            status={qualityAnalysis.waterClassification}
            purityScore={qualityAnalysis.purityScore}
            reasoning={qualityAnalysis.reasoning}
          />
        )}

        {/* RO Filter Health — phase 0.15 */}
        {isLoading ? (
          <Skeleton height={180} borderRadius={18} />
        ) : (
          <WaterCard phase={0.15} flowSpeed={6500} flowOpacity={0.05}>
            <FilterLifespanWidget filters={filters} />
          </WaterCard>
        )}

        {/* Roof Tank — phase 0.42 */}
        {tankInfo && (
          <WaterCard phase={0.42} flowSpeed={8000} flowOpacity={0.045}>
            <TankLevelCard tankInfo={tankInfo} />
          </WaterCard>
        )}

        {/* Daily Usage — phase 0.68 */}
        {usageStats && (
          <WaterCard phase={0.68} flowSpeed={7000} flowOpacity={0.05}>
            <WaterUsageCard stats={usageStats} />
          </WaterCard>
        )}

        {/* Live Sensor Telemetry Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Purifier Sensor Telemetry
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AnalyticsTab')}>
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>
              Live Waveform →
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridContainer}>
          <SensorCard
            icon="🧪"
            name="pH Level"
            value={liveReading.pH}
            unit="pH"
            normalRange={SENSOR_THRESHOLDS.pH.normalRangeText}
            status="NORMAL"
            statusColor="#2E7D32"
          />
          <SensorCard
            icon="💧"
            name="TDS Level"
            value={liveReading.tds}
            unit="ppm"
            normalRange={SENSOR_THRESHOLDS.tds.normalRangeText}
            status="NORMAL"
            statusColor="#26A69A"
          />
          <SensorCard
            icon="🌡️"
            name="Temperature"
            value={liveReading.temperature}
            unit="°C"
            normalRange={SENSOR_THRESHOLDS.temperature.normalRangeText}
            status="NORMAL"
            statusColor="#F9A825"
          />
          <SensorCard
            icon="🌊"
            name="Turbidity"
            value={liveReading.turbidity}
            unit="NTU"
            normalRange={SENSOR_THRESHOLDS.turbidity.normalRangeText}
            status="NORMAL"
            statusColor="#2E7D32"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: 90,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  viewAllText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
