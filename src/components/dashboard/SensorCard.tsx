import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';

interface SensorCardProps {
  icon: string;
  name: string;
  value: string | number;
  unit: string;
  normalRange: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  statusColor: string;
  lastUpdated?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  icon,
  name,
  value,
  unit,
  normalRange,
  status,
  statusColor,
  lastUpdated = 'Just now',
}) => {
  const { theme } = useAppTheme();

  // Glow pulse for live dot
  const pulseAnim = React.useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.cardContainer, {backgroundColor: theme.colors.card, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border}]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconWrapper, { backgroundColor: `${statusColor}18` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Animated.View style={[styles.statusDot, { backgroundColor: statusColor, opacity: pulseAnim }]} />
      </View>

      <Text style={[styles.sensorName, { color: theme.colors.textSecondary }]}>{name}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.valueText, { color: theme.colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.unitText, { color: theme.colors.textMuted }]}>{unit}</Text>
      </View>

      {/* Progress Line */}
      <View style={[styles.progressTrack, { backgroundColor: theme.isDark ? '#334155' : '#E2E8F0' }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: statusColor,
              width: status === 'NORMAL' ? '65%' : status === 'WARNING' ? '85%' : '100%',
            },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.rangeText, { color: theme.colors.textMuted }]}>
          Range: {normalRange}
        </Text>
        <Text style={[styles.updatedText, { color: theme.colors.textMuted }]}>{lastUpdated}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '48%',
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sensorName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    marginTop: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: Spacing.xs,
  },
  valueText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  unitText: {
    fontSize: Typography.sizes.xs,
    marginLeft: 4,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    marginVertical: Spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  rangeText: {
    fontSize: 9,
  },
  updatedText: {
    fontSize: 9,
  },
});

