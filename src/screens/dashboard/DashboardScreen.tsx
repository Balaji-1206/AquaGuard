import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useWaterData } from '../../hooks/useWaterData';
import { useNotifications } from '../../context/NotificationContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { PuritySafetyCard } from '../../components/home/PuritySafetyCard';
import { FilterLifespanWidget } from '../../components/home/FilterLifespanWidget';
import { TankLevelCard } from '../../components/home/TankLevelCard';
import { WaterUsageCard } from '../../components/home/WaterUsageCard';
import { SensorCard } from '../../components/dashboard/SensorCard';
import { ContaminationMap } from '../../components/dashboard/ContaminationMap';
import { WaterCard } from '../../components/common/WaterCard';
import { Skeleton } from '../../components/common/Skeleton';
import { SENSOR_THRESHOLDS } from '../../constants/thresholds';
import { DEMO_CONTAMINATION_EVENTS } from '../../constants/demoMockData';
import { ContaminationSourceEvent } from '../../types';
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

  const { alerts } = useNotifications();
  const { theme } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [mapDismissed, setMapDismissed] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setMapDismissed(false); // Re-show map after refresh
    await refreshData();
    setRefreshing(false);
  };

  // ── Novelty 3: Find a contamination source event from alerts or demo data ─
  const contaminationEvent = useMemo<ContaminationSourceEvent | null>(() => {
    if (mapDismissed) return null;

    // 1. Check active alerts for a contamination source alert (from live backend)
    const ctamAlert = alerts.find(
      (a) => !a.isResolved && a.title.includes('Contamination Source')
    );
    if (ctamAlert) {
      return {
        id: ctamAlert.id,
        timestamp: new Date().toISOString(),
        sourceZone: ctamAlert.zone,
        affectedZones: [ctamAlert.zone],
        confidence: 87,
        evidenceRules: [],
        recommendedAction: ctamAlert.actionTaken,
      };
    }

    // 2. Check demo data for an active contamination event
    const demoEvent = DEMO_CONTAMINATION_EVENTS.find((e) => {
      // Show demo event if sensor readings are anomalous
      return (
        liveReading.flowRate > 10 ||
        liveReading.turbidity > 3.0 ||
        liveReading.pH < 6.3
      );
    });
    if (demoEvent) {
      return demoEvent as unknown as ContaminationSourceEvent;
    }

    return null;
  }, [alerts, liveReading, mapDismissed]);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Header onNotificationPress={() => navigation.navigate('AlertsTimeline')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Novelty 3: Contamination Source Map (shown when event is active) ── */}
        {contaminationEvent && (
          <ContaminationMap
            event={contaminationEvent}
            onDismiss={() => setMapDismissed(true)}
          />
        )}

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

        {/* RO Filter Health — Novelty 1: AI Predictions inside widget */}
        {isLoading ? (
          <Skeleton height={220} borderRadius={18} />
        ) : (
          <WaterCard phase={0.15} flowSpeed={6500} flowOpacity={0.05}>
            <FilterLifespanWidget filters={filters} />
          </WaterCard>
        )}

        {/* Roof Tank */}
        {tankInfo && (
          <WaterCard phase={0.42} flowSpeed={8000} flowOpacity={0.045}>
            <TankLevelCard tankInfo={tankInfo} />
          </WaterCard>
        )}

        {/* Daily Usage */}
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
            status={liveReading.pH < 6.5 || liveReading.pH > 8.5 ? 'CRITICAL' : liveReading.pH < 6.8 ? 'WARNING' : 'NORMAL'}
            statusColor={liveReading.pH < 6.5 || liveReading.pH > 8.5 ? '#EF4444' : liveReading.pH < 6.8 ? '#F97316' : '#2E7D32'}
          />
          <SensorCard
            icon="💧"
            name="TDS Level"
            value={liveReading.tds}
            unit="ppm"
            normalRange={SENSOR_THRESHOLDS.tds.normalRangeText}
            status={liveReading.tds > 300 ? 'CRITICAL' : liveReading.tds > 180 ? 'WARNING' : 'NORMAL'}
            statusColor={liveReading.tds > 300 ? '#EF4444' : liveReading.tds > 180 ? '#F97316' : '#26A69A'}
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
            status={liveReading.turbidity > 4.0 ? 'CRITICAL' : liveReading.turbidity > 1.5 ? 'WARNING' : 'NORMAL'}
            statusColor={liveReading.turbidity > 4.0 ? '#EF4444' : liveReading.turbidity > 1.5 ? '#F97316' : '#2E7D32'}
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
