import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useWaterData } from '../../hooks/useWaterData';
import { useAppTheme } from '../../context/ThemeContext';
import { Badge } from '../../components/common/Badge';
import { getWaterStatusColor } from '../../utils/waterQuality';
import { Typography, Spacing } from '../../theme';

export const AIInsightsScreen: React.FC = () => {
  const { qualityAnalysis, refreshData } = useWaterData();
  const { theme } = useAppTheme();

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const statusColor = getWaterStatusColor(qualityAnalysis.waterClassification);
  const chartPoints = [
    { label: 'Mon', value: 98 },
    { label: 'Tue', value: 99 },
    { label: 'Wed', value: 99 },
    { label: 'Thu', value: 97 },
    { label: 'Fri', value: 99 },
    { label: 'Today', value: qualityAnalysis.purityScore },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brain Graphic Header */}
        <View style={[styles.brainCard, { backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border }]}>
          <View style={styles.brainHeaderRow}>
            <Animated.View
              style={[
                styles.brainIconWrapper,
                { transform: [{ scale: pulseAnim }], backgroundColor: `${statusColor}20` },
              ]}
            >
              <Text style={styles.brainIcon}>🧠</Text>
            </Animated.View>

            <View style={styles.brainTextWrapper}>
              <Text style={[styles.aiSubtitle, { color: theme.colors.textSecondary }]}>
                Home Water Safety Advisor
              </Text>
              <View style={styles.statusRow}>
                <Text style={[styles.statusVal, { color: statusColor }]}>
                  {qualityAnalysis.waterClassification}
                </Text>
                <Badge
                  label={`Purity ${qualityAnalysis.purityScore}%`}
                  color={statusColor}
                  size="sm"
                />
              </View>
            </View>
          </View>

          <Text style={[styles.reasoningText, { color: theme.colors.textPrimary }]}>
            "{qualityAnalysis.reasoning}"
          </Text>
        </View>

        {/* Home Purity Score Trend */}
        <View style={[{ backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: Spacing.md, marginBottom: Spacing.md }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color: theme.colors.textPrimary }]}>
                7-Day Household Purity Score
              </Text>
              <Text style={[styles.chartSub, { color: theme.colors.textSecondary }]}>
                RO Purifier Filtration Quality Score
              </Text>
            </View>
            <Badge label="Purity: 99%" color="#2E7D32" size="sm" />
          </View>

          {/* Mini purity bar chart */}
          <View style={{ height: 80, flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: Spacing.sm }}>
            {[88, 91, 95, 93, 97, 98, 99].map((v, i) => (
              <View key={i} style={{ flex: 1, height: `${v}%` as any, backgroundColor: '#26A69A', borderRadius: 4, opacity: 0.7 + i * 0.04 }} />
            ))}
          </View>
        </View>

        {/* AI Recommendations */}
        <View style={styles.recHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Smart Home AI Recommendations
          </Text>
          <TouchableOpacity onPress={refreshData}>
            <Text style={[styles.refreshText, { color: theme.colors.primary }]}>🔄 Re-Analyze</Text>
          </TouchableOpacity>
        </View>

        {qualityAnalysis.recommendedActions.map((rec: string, index: number) => (
          <View key={index} style={[styles.recCard, { backgroundColor: theme.colors.card, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, padding: Spacing.md }]}>
            <View style={styles.recTop}>
              <Text style={[styles.recTitle, { color: theme.colors.textPrimary }]}>
                💡 Recommendation #{index + 1}
              </Text>
              <Badge label="OPTIMAL" color="#26A69A" size="sm" />
            </View>

            <Text style={[styles.recDesc, { color: theme.colors.textSecondary }]}>{rec}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  brainCard: {
    padding: Spacing.lg,
  },
  brainHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brainIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  brainIcon: {
    fontSize: 32,
  },
  brainTextWrapper: {
    flex: 1,
  },
  aiSubtitle: {
    fontSize: Typography.sizes.xs,
    textTransform: 'uppercase',
    fontWeight: Typography.weights.medium,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusVal: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
    marginRight: Spacing.sm,
  },
  reasoningText: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.md,
    fontStyle: 'italic',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  chartTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  chartSub: {
    fontSize: Typography.sizes.xs,
  },
  recHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  refreshText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  recCard: {
    marginBottom: Spacing.sm,
  },
  recTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  recTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  recDesc: {
    fontSize: Typography.sizes.xs,
  },
});
