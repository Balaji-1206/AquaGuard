import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';

export type FilterCategory = 'ALL' | 'ACTIVE' | 'CRITICAL' | 'WARNING' | 'INFO' | 'RESOLVED';

interface FilterOption {
  key: FilterCategory;
  label: string;
  count: number;
}

interface AlertFilterBarProps {
  selectedFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  counts: Record<FilterCategory, number>;
}

export const AlertFilterBar: React.FC<AlertFilterBarProps> = ({
  selectedFilter,
  onSelectFilter,
  counts,
}) => {
  const { theme } = useAppTheme();

  const options: FilterOption[] = [
    { key: 'ALL', label: 'All', count: counts.ALL },
    { key: 'ACTIVE', label: 'Active', count: counts.ACTIVE },
    { key: 'CRITICAL', label: 'Critical', count: counts.CRITICAL },
    { key: 'WARNING', label: 'Warning', count: counts.WARNING },
    { key: 'INFO', label: 'Info', count: counts.INFO },
    { key: 'RESOLVED', label: 'Resolved', count: counts.RESOLVED },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((opt) => {
          const isSelected = selectedFilter === opt.key;
          
          let activeColor = theme.colors.primary;
          if (opt.key === 'CRITICAL') activeColor = '#EF4444';
          else if (opt.key === 'WARNING') activeColor = '#F59E0B';
          else if (opt.key === 'INFO') activeColor = '#06B6D4';
          else if (opt.key === 'RESOLVED') activeColor = '#10B981';

          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.7}
              onPress={() => onSelectFilter(opt.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? activeColor
                    : theme.isDark
                    ? '#1C2541'
                    : '#FFFFFF',
                  borderColor: isSelected
                    ? activeColor
                    : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.colors.textSecondary,
                    fontWeight: isSelected
                      ? Typography.weights.bold
                      : Typography.weights.medium,
                  },
                ]}
              >
                {opt.label}
              </Text>

              {opt.count >= 0 && (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(255,255,255,0.25)'
                        : theme.isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isSelected ? '#FFFFFF' : theme.colors.textMuted,
                      },
                    ]}
                  >
                    {opt.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: Typography.sizes.xs,
    marginRight: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
