import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeAlert, Severity } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';

interface AlertCardProps {
  alert: HomeAlert;
  onResolve: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onResolve }) => {
  const { theme } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityStyle = (sev: Severity, isResolved: boolean) => {
    if (isResolved) {
      return {
        accentColor: '#10B981',
        badgeBg: theme.isDark ? '#064E3B' : '#ECFDF5',
        badgeText: '#10B981',
        borderColor: theme.colors.border,
        icon: '✓',
        gradient: theme.isDark
          ? (['#1E293B', '#0F172A'] as const)
          : (['#FFFFFF', '#F8FAFC'] as const),
      };
    }

    switch (sev) {
      case 'CRITICAL':
        return {
          accentColor: '#EF4444',
          badgeBg: theme.isDark ? '#7F1D1D' : '#FEF2F2',
          badgeText: '#EF4444',
          borderColor: '#F87171',
          icon: '🚨',
          gradient: theme.isDark
            ? (['#2A1215', '#1C2541'] as const)
            : (['#FFF5F5', '#FFFFFF'] as const),
        };
      case 'WARNING':
        return {
          accentColor: '#F59E0B',
          badgeBg: theme.isDark ? '#78350F' : '#FFFBEB',
          badgeText: '#F59E0B',
          borderColor: '#FBBF24',
          icon: '⚠️',
          gradient: theme.isDark
            ? (['#291F0E', '#1C2541'] as const)
            : (['#FFFDF5', '#FFFFFF'] as const),
        };
      case 'INFO':
      default:
        return {
          accentColor: '#0284C7',
          badgeBg: theme.isDark ? '#0C4A6E' : '#F0F9FF',
          badgeText: '#0284C7',
          borderColor: '#7DD3FC',
          icon: '💧',
          gradient: theme.isDark
            ? (['#0C2340', '#1C2541'] as const)
            : (['#F0F9FF', '#FFFFFF'] as const),
        };
    }
  };

  const styleConfig = getSeverityStyle(alert.severity, alert.isResolved);

  return (
    <View
      style={[
        styles.outerCard,
        {
          shadowColor: theme.isDark ? '#000000' : '#0284C7',
        },
      ]}
    >
      <LinearGradient
        colors={styleConfig.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.cardGradientContainer,
          {
            borderColor: alert.isResolved ? theme.colors.border : styleConfig.borderColor,
          },
        ]}
      >
        {/* Left Severity Accent Bar */}
        <View
          style={[
            styles.severityBar,
            { backgroundColor: styleConfig.accentColor },
          ]}
        />

        <View style={styles.contentBody}>
          {/* Top Meta Header */}
          <View style={styles.headerRow}>
            <View style={styles.badgeCluster}>
              <View style={[styles.sevBadge, { backgroundColor: styleConfig.badgeBg }]}>
                <Text style={styles.sevIcon}>{styleConfig.icon}</Text>
                <Text style={[styles.sevText, { color: styleConfig.badgeText }]}>
                  {alert.isResolved ? 'RESOLVED' : alert.severity}
                </Text>
              </View>

              <View
                style={[
                  styles.zonePill,
                  { backgroundColor: theme.isDark ? '#3A506B' : '#E0F2FE' },
                ]}
              >
                <Text style={[styles.zoneText, { color: theme.colors.textSecondary }]}>
                  {alert.zone}
                </Text>
              </View>
            </View>

            <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
              🕒 {alert.time}
            </Text>
          </View>

          {/* Main Title & Description */}
          <View style={styles.textSection}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {alert.title}
            </Text>
            <Text style={[styles.deviceName, { color: theme.colors.textMuted }]}>
              📍 Device: {alert.deviceName}
            </Text>
            <Text
              style={[styles.message, { color: theme.colors.textSecondary }]}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {alert.message}
            </Text>
          </View>

          {/* Auto Action Log Box */}
          {alert.actionTaken ? (
            <View
              style={[
                styles.actionBox,
                {
                  backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(2, 132, 199, 0.05)',
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.actionTag, { color: styleConfig.accentColor }]}>
                ⚡ SYSTEM ACTION TAKEN:
              </Text>
              <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>
                {alert.actionTaken}
              </Text>
            </View>
          ) : null}

          {/* Expand Details & Footer Actions */}
          <View style={[styles.footerRow, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.expandBtn}
            >
              <Text style={[styles.expandBtnText, { color: theme.colors.primary }]}>
                {isExpanded ? 'Hide Details ▲' : 'View Full Logs ▼'}
              </Text>
            </TouchableOpacity>

            {!alert.isResolved ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dismissTouchable}
                onPress={() => onResolve(alert.id)}
              >
                <LinearGradient
                  colors={['#0EA5E9', '#0284C7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dismissGradient}
                >
                  <Text style={styles.dismissText}>✓ Dismiss & Resolve</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.resolvedLabel}>
                <Text style={styles.resolvedLabelText}>✓ Case Closed</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerCard: {
    marginBottom: Spacing.md,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardGradientContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  severityBar: {
    width: 6,
  },
  contentBody: {
    flex: 1,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  sevBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sevIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  sevText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  zonePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  zoneText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  textSection: {
    marginVertical: 4,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    lineHeight: 22,
  },
  deviceName: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  message: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  actionBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 4,
  },
  actionTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 8,
    borderTopWidth: 1,
  },
  expandBtn: {
    paddingVertical: 4,
  },
  expandBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  dismissTouchable: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  dismissGradient: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  resolvedLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  resolvedLabelText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
});
