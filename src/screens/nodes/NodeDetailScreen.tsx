import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { mockApi } from '../../services/mockApi';
import { SmartWaterDevice } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';

import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { formatRssiToSignal } from '../../utils/formatters';
import { Typography, Spacing } from '../../theme';

interface NodeDetailScreenProps {
  route: any;
  navigation: any;
}

export const NodeDetailScreen: React.FC<NodeDetailScreenProps> = ({ route, navigation }) => {
  const { nodeId } = route.params || { nodeId: 'DEV-RO-01' };
  const { theme } = useAppTheme();
  const [device, setDevice] = useState<SmartWaterDevice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    mockApi.fetchDeviceDetails(nodeId).then((data) => {
      setDevice(data);
      setIsLoading(false);
    });
  }, [nodeId]);

  if (isLoading || !device) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: Spacing.md }}>
        <Skeleton height={200} borderRadius={18} />
        <Skeleton height={140} borderRadius={18} />
      </View>
    );
  }

  const rssiInfo = formatRssiToSignal(device.wifiSignal);

  const handleToggleValve = async () => {
    const nextState = device.valveState === 'OPEN' ? 'CLOSED' : 'OPEN';
    const updated = await mockApi.toggleSmartValve(device.id, nextState);
    setDevice(updated);
    Alert.alert('Valve State Updated', `${device.name} is now ${nextState}.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Header */}
      <View style={[styles.navHeader, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.colors.textPrimary }]}>{device.id}</Text>
        <TouchableOpacity onPress={handleToggleValve}>
          <Text style={[styles.calibrateText, { color: theme.colors.secondary }]}>🚰 Toggle Valve</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Device Info Card */}
        <View style={{backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 16, marginBottom: 12}}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nodeTitle, { color: theme.colors.textPrimary }]}>{device.name}</Text>
              <Text style={[styles.villageSub, { color: theme.colors.textSecondary }]}>
                {device.location} • {device.zone}
              </Text>
            </View>
            <Badge label={device.status} color={device.status === 'ONLINE' ? '#2E7D32' : '#D32F2F'} />
          </View>
        </View>

        {/* Hardware & Network */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Device Hardware</Text>
        <View style={styles.hardwareGrid}>
          <View style={[styles.hwCard, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
            <Text style={[styles.hwLabel, { color: theme.colors.textSecondary }]}>Smart Shutoff Valve</Text>
            <Text style={[styles.hwVal, { color: device.valveState === 'OPEN' ? '#2E7D32' : '#D32F2F' }]}>
              {device.valveState === 'OPEN' ? '🚰 OPEN' : '🚫 SHUT'}
            </Text>
            <Text style={[styles.hwSub, { color: theme.colors.textMuted }]}>Auto-leak protected</Text>
          </View>

          <View style={[styles.hwCard, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
            <Text style={[styles.hwLabel, { color: theme.colors.textSecondary }]}>Home Wi-Fi RSSI</Text>
            <Text style={[styles.hwVal, { color: rssiInfo.color }]}>📶 {device.wifiSignal} dBm</Text>
            <Text style={[styles.hwSub, { color: theme.colors.textMuted }]}>{rssiInfo.label} Signal</Text>
          </View>
        </View>

        {/* Live Purifier Telemetry */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Purifier Sensor Telemetry</Text>
        <View style={{backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 16, marginBottom: 12}}>
          <View style={styles.telemetryRow}>
            <Text style={[styles.telemetryLabel, { color: theme.colors.textPrimary }]}>💧 TDS Purity</Text>
            <Text style={[styles.telemetryVal, { color: theme.colors.secondary }]}>{device.readings.tds} ppm</Text>
          </View>
          <View style={styles.telemetryRow}>
            <Text style={[styles.telemetryLabel, { color: theme.colors.textPrimary }]}>🧪 pH Level</Text>
            <Text style={[styles.telemetryVal, { color: theme.colors.primary }]}>{device.readings.pH} pH</Text>
          </View>
          <View style={styles.telemetryRow}>
            <Text style={[styles.telemetryLabel, { color: theme.colors.textPrimary }]}>🌡️ Water Temperature</Text>
            <Text style={[styles.telemetryVal, { color: '#F9A825' }]}>{device.readings.temperature} °C</Text>
          </View>
          <View style={styles.telemetryRow}>
            <Text style={[styles.telemetryLabel, { color: theme.colors.textPrimary }]}>🌊 Turbidity</Text>
            <Text style={[styles.telemetryVal, { color: '#2E7D32' }]}>{device.readings.turbidity} NTU</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  navTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  calibrateText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nodeTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  villageSub: {
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  hardwareGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hwCard: {
    width: '48%',
  },
  hwLabel: {
    fontSize: Typography.sizes.xs,
  },
  hwVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginVertical: 4,
  },
  hwSub: {
    fontSize: 10,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  telemetryLabel: {
    fontSize: Typography.sizes.sm,
  },
  telemetryVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});

