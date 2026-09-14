import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EarlyWarningScoreResult } from '../../types';
import { getEWSTierColor } from '../../services/earlyWarningScoreEngine';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';

interface EarlyWarningScoreWidgetProps {
  ewsResult: EarlyWarningScoreResult;
}

export const EarlyWarningScoreWidget: React.FC<EarlyWarningScoreWidgetProps> = ({ ewsResult }) => {
  const { theme } = useAppTheme();
  const tierColor = getEWSTierColor(ewsResult.riskTier);

  // Sub-score items for horizontal progress bars
  const subScoreItems = [
    { label: 'pH Risk', value: ewsResult.breakdown.phScore, max: 25, color: '#3B82F6' },
    { label: 'TDS Risk', value: ewsResult.breakdown.tdsScore, max: 25, color: '#10B981' },
    { label: 'Turbidity', value: ewsResult.breakdown.turbidityScore, max: 25, color: '#F59E0B' },
    { label: 'Flow Spike', value: ewsResult.breakdown.flowScore, max: 25, color: '#EC4899' },
    { label: 'Velocity Bonus', value: ewsResult.breakdown.velocityBonus, max: 20, color: '#8B5CF6' },
  ];

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.isDark ? '#334155' : '#E2E8F0',
        },
      ]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={styles.iconEmoji}>⚠️</Text>
          <View>
            <Text style={[styles.titleText, { color: theme.colors.textPrimary }]}>
              Early Warning Score (EWS)
            </Text>
            <Text style={[styles.subtitleText, { color: theme.colors.textMuted }]}>
              Multi-parameter water risk model
            </Text>
          </View>
        </View>

        {/* Risk Tier Badge */}
        <View style={[styles.badge, { backgroundColor: tierColor.badge }]}>
          <Text style={styles.badgeText}>{ewsResult.riskTier}</Text>
        </View>
      </View>

      {/* Main Score & Trend Gauge Row */}
      <View style={styles.scoreRow}>
        <View style={[styles.scoreRing, { borderColor: tierColor.badge }]}>
          <Text style={[styles.scoreValueText, { color: tierColor.text }]}>
            {ewsResult.ewsScore}
          </Text>
          <Text style={styles.scoreScaleText}>/100</Text>
        </View>

        <View style={styles.trendContainer}>
          <View style={styles.trendRow}>
            <Text style={[styles.trendLabel, { color: theme.colors.textMuted }]}>
              Deterioration Velocity:
            </Text>
            <View
              style={[
                styles.trendPill,
                {
                  backgroundColor:
                    ewsResult.trend === 'RAPIDLY_DETERIORATING'
                      ? '#FEE2E2'
                      : ewsResult.trend === 'DETERIORATING'
                      ? '#FEF3C7'
                      : '#DCFCE7',
                },
              ]}
            >
              <Text
                style={[
                  styles.trendPillText,
                  {
                    color:
                      ewsResult.trend === 'RAPIDLY_DETERIORATING'
                        ? '#DC2626'
                        : ewsResult.trend === 'DETERIORATING'
                        ? '#D97706'
                        : '#16A34A',
                  },
                ]}
              >
                {ewsResult.trend.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <Text style={[styles.primaryFactorText, { color: theme.colors.textSecondary }]}>
            🎯 <Text style={{ fontWeight: '700' }}>Dominant Risk:</Text> {ewsResult.primaryRiskFactor}
          </Text>
        </View>
      </View>

      {/* Breakdown Progress Bars */}
      <View style={styles.breakdownSection}>
        <Text style={[styles.breakdownTitle, { color: theme.colors.textPrimary }]}>
          Parameter Risk Sub-scores
        </Text>

        <View style={styles.barsGrid}>
          {subScoreItems.map((item, index) => {
            const fillWidthPercent = Math.min(100, Math.round((item.value / item.max) * 100));
            return (
              <View key={index} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.barValText, { color: theme.colors.textPrimary }]}>
                    {item.value}/{item.max}
                  </Text>
                </View>
                <View
                  style={[
                    styles.barTrack,
                    { backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9' },
                  ]}
                >
                  <View
                    style={[
                      styles.barFill,
                      { width: `${fillWidthPercent}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Action Recommendation Footer */}
      <View
        style={[
          styles.recommendationBox,
          { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC', borderColor: theme.colors.border },
        ]}
      >
        <Text style={styles.recIcon}>💡</Text>
        <Text style={[styles.recText, { color: theme.colors.textSecondary }]}>
          {ewsResult.recommendation}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconEmoji: {
    fontSize: 22,
  },
  titleText: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
  },
  subtitleText: {
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 16,
  },
  scoreRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  scoreValueText: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
  scoreScaleText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  trendContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendLabel: {
    fontSize: 11,
    marginRight: 6,
  },
  trendPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  primaryFactorText: {
    fontSize: 11,
    lineHeight: 16,
  },
  breakdownSection: {
    marginTop: 4,
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  barsGrid: {
    gap: 8,
  },
  barItem: {
    width: '100%',
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  barValText: {
    fontSize: 10,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  recIcon: {
    fontSize: 14,
  },
  recText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
