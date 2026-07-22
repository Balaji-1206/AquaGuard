import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';
import { WaterUsageStats } from '../../types';

interface WaterUsageCardProps {
  stats: WaterUsageStats;
}

export const WaterUsageCard: React.FC<WaterUsageCardProps> = ({ stats }) => {
  const { theme } = useAppTheme();
  const percentage = Math.min(100, Math.round((stats.todayLiters / stats.targetDailyLimitLiters) * 100));

  return (
    <View style={[styles.card, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Household Hydro Usage Today
          </Text>
          <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
            Daily Target: {stats.targetDailyLimitLiters} Liters
          </Text>
        </View>
        <Text style={[styles.usageVal, { color: theme.colors.primary }]}>
          💧 {stats.todayLiters} L
        </Text>
      </View>

      {/* Aqua Progress Track */}
      <View style={[styles.track, { backgroundColor: theme.isDark ? '#3A506B' : '#E0F2FE' }]}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: percentage > 90 ? '#EF4444' : '#0284C7' },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
          Weekly Average: {stats.weeklyAvgLiters} L/day
        </Text>
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
          {percentage}% of Household Target
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sub: {
    fontSize: Typography.sizes.xs,
  },
  usageVal: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  footerText: {
    fontSize: 10,
  },
});

