import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';
import { ROFilterCartridge } from '../../types';
import { mockApi } from '../../services/mockApi';
import { predictAllFilters, getConfidenceBand } from '../../services/filterDegradationEngine';
import { DEMO_FILTER_HISTORY } from '../../constants/demoMockData';

interface FilterLifespanWidgetProps {
  filters: ROFilterCartridge[];
}

const TREND_ICONS: Record<string, string> = {
  ACCELERATING: '📈',
  STABLE:       '➡️',
  RECOVERING:   '📉',
};
const TREND_COLORS: Record<string, string> = {
  ACCELERATING: '#EF4444',
  STABLE:       '#26A69A',
  RECOVERING:   '#22C55E',
};

export const FilterLifespanWidget: React.FC<FilterLifespanWidgetProps> = ({ filters }) => {
  const { theme } = useAppTheme();

  // Compute AI predictions for all filters using historical load data
  const predictions = useMemo(
    () => predictAllFilters(filters, DEMO_FILTER_HISTORY),
    [filters]
  );
  const predictionMap = useMemo(
    () => Object.fromEntries(predictions.map((p) => [p.filterId, p])),
    [predictions]
  );

  const handleOrder = async (filter: ROFilterCartridge) => {
    const msg = await mockApi.orderReplacementFilter(filter.id);
    Alert.alert('Order Dispatched 📦', msg);
  };

  return (
    <View>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            RO Filter Health
          </Text>
          <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
            4-Stage Cartridge · AI Lifespan Forecast
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.orderAllBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => Alert.alert('Order Complete Kit', 'Complete 4-Stage Replacement Kit added to cart!')}
        >
          <Text style={styles.orderAllText}>📦 Order Kit</Text>
        </TouchableOpacity>
      </View>

      {/* 2x2 Cartridge Grid */}
      <View style={styles.grid}>
        {filters.map((filter) => {
          const isLow      = filter.healthPercent <= 25;
          const color      = isLow ? '#D32F2F' : filter.healthPercent <= 60 ? '#F9A825' : '#2E7D32';
          const prediction = predictionMap[filter.id];
          const band       = prediction ? getConfidenceBand(prediction) : null;
          const trendIcon  = prediction ? TREND_ICONS[prediction.degradationTrend] : '';
          const trendColor = prediction ? TREND_COLORS[prediction.degradationTrend] : color;

          const showAiDiff =
            prediction &&
            Math.abs(prediction.predictedDays - prediction.calendarDays) >= 2;

          return (
            <TouchableOpacity
              key={filter.id}
              activeOpacity={0.85}
              style={[
                styles.gridItem,
                {
                  backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isLow ? '#D32F2F60' : theme.colors.border,
                },
              ]}
              onPress={() => isLow && handleOrder(filter)}
            >
              {/* Top row: type + health % */}
              <View style={styles.itemTopRow}>
                <Text style={[styles.filterTypeLabel, { color: theme.colors.textSecondary }]}>
                  {filter.type}
                </Text>
                <Text style={[styles.percentBadgeText, { color }]}>
                  {filter.healthPercent}%
                </Text>
              </View>

              <Text
                style={[styles.filterName, { color: theme.colors.textPrimary }]}
                numberOfLines={1}
              >
                {filter.name.replace('Cartridge', '').replace('Filter', '')}
              </Text>

              {/* Health Progress Bar */}
              <View style={[styles.track, { backgroundColor: theme.isDark ? '#334155' : '#E2E8F0' }]}>
                <View style={[styles.fill, { width: `${filter.healthPercent}%`, backgroundColor: color }]} />
              </View>

              {/* Calendar days */}
              <Text style={[styles.daysText, { color: isLow ? '#D32F2F' : theme.colors.textMuted }]}>
                {isLow ? '⚠️ Tap to Reorder' : `📅 ${filter.daysRemaining} days (calendar)`}
              </Text>

              {/* ── AI Prediction Row ── */}
              {prediction && (
                <View style={[styles.aiRow, { backgroundColor: theme.isDark ? '#1E293B' : '#F0F9FF', borderColor: trendColor + '40' }]}>
                  <Text style={styles.aiLabel}>🧠 AI Forecast</Text>
                  <View style={styles.aiRight}>
                    <Text style={[styles.aiDays, { color: trendColor }]}>
                      {prediction.predictedDays}d {band}
                    </Text>
                    <Text style={[styles.trendChip, { color: trendColor }]}>
                      {trendIcon} {prediction.degradationTrend.toLowerCase()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Show difference callout */}
              {showAiDiff && prediction && (
                <Text style={[styles.diffNote, { color: prediction.predictedDays < prediction.calendarDays ? '#EF4444' : '#22C55E' }]}>
                  {prediction.predictedDays < prediction.calendarDays
                    ? `⚡ ${prediction.calendarDays - prediction.predictedDays}d sooner than calendar`
                    : `✅ ${prediction.predictedDays - prediction.calendarDays}d longer than calendar`}
                </Text>
              )}

              {/* Confidence indicator */}
              {prediction && (
                <View style={styles.confRow}>
                  <View style={[styles.confBar, { backgroundColor: theme.isDark ? '#334155' : '#E2E8F0' }]}>
                    <View style={[styles.confFill, { width: `${prediction.confidencePercent}%`, backgroundColor: trendColor }]} />
                  </View>
                  <Text style={[styles.confLabel, { color: theme.colors.textMuted }]}>
                    {prediction.confidencePercent}% conf.
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legendRow, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.colors.border }]}>
        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
          🧠 AI forecast uses 14-day TDS/turbidity/flow load history to predict actual filter wear rate
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  orderAllBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.borderRadius.sm,
  },
  orderAllText: {
    color: '#FFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  gridItem: {
    width: '48.5%',
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterTypeLabel: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  percentBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.heavy,
  },
  filterName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginVertical: 2,
  },
  track: {
    height: 4,
    borderRadius: 2,
    marginVertical: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  daysText: {
    fontSize: 9,
    fontWeight: Typography.weights.medium,
    marginBottom: 3,
  },
  // AI Prediction section
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginTop: 3,
  },
  aiLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
  },
  aiRight: {
    alignItems: 'flex-end',
  },
  aiDays: {
    fontSize: 9,
    fontWeight: '800',
  },
  trendChip: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  diffNote: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  confRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  confBar: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  confFill: {
    height: '100%',
    borderRadius: 1,
  },
  confLabel: {
    fontSize: 8,
  },
  legendRow: {
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.xs,
    marginTop: Spacing.xs,
  },
  legendText: {
    fontSize: 9,
    lineHeight: 13,
  },
});
