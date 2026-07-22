import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';
import { ROFilterCartridge } from '../../types';
import { mockApi } from '../../services/mockApi';

interface FilterLifespanWidgetProps {
  filters: ROFilterCartridge[];
}

export const FilterLifespanWidget: React.FC<FilterLifespanWidgetProps> = ({ filters }) => {
  const { theme } = useAppTheme();

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
            4-Stage Cartridge Lifespan
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
          const isLow = filter.healthPercent <= 25;
          const color = isLow ? '#D32F2F' : filter.healthPercent <= 60 ? '#F9A825' : '#2E7D32';

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
              <View style={styles.itemTopRow}>
                <Text style={[styles.filterTypeLabel, { color: theme.colors.textSecondary }]}>
                  {filter.type}
                </Text>
                <Text style={[styles.percentBadgeText, { color }]}>{filter.healthPercent}%</Text>
              </View>

              <Text style={[styles.filterName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                {filter.name.replace('Cartridge', '').replace('Filter', '')}
              </Text>

              {/* Progress Bar */}
              <View style={[styles.track, { backgroundColor: theme.isDark ? '#334155' : '#E2E8F0' }]}>
                <View style={[styles.fill, { width: `${filter.healthPercent}%`, backgroundColor: color }]} />
              </View>

              <Text style={[styles.daysText, { color: isLow ? '#D32F2F' : theme.colors.textMuted }]}>
                {isLow ? '⚠️ Tap to Reorder' : `${filter.daysRemaining} days left`}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    marginVertical: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  daysText: {
    fontSize: 9,
    fontWeight: Typography.weights.medium,
  },
});
