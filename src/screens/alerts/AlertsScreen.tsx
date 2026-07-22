import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNotifications } from '../../context/NotificationContext';
import { useAppTheme } from '../../context/ThemeContext';

import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { Typography, Spacing } from '../../theme';

export const AlertsScreen: React.FC = () => {
  const { alerts, unresolvedCount, resolveAlert, refreshAlerts, isLoading } = useNotifications();
  const { theme } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: Spacing.md }}>
      {/* Header Summary */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Home Water Alerts</Text>
          <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
            {unresolvedCount} Active Notifications & Filter Reminders
          </Text>
        </View>
        <TouchableOpacity onPress={refreshAlerts}>
          <Text style={[styles.refreshText, { color: theme.colors.primary }]}>🔄 Sync Alerts</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View>
          <Skeleton height={120} borderRadius={18} />
          <Skeleton height={120} borderRadius={18} />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: { item: any }) => (
            <View style={[styles.alertCard, {backgroundColor: theme.colors.card, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border}]}>
              <View style={styles.cardHeader}>
                <Badge label={item.severity} color={item.severity === 'WARNING' ? '#F9A825' : '#1565C0'} size="sm" />
                <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>{item.time}</Text>
              </View>

              <Text style={[styles.alertTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.alertMsg, { color: theme.colors.textSecondary }]}>{item.message}</Text>

              <View style={styles.cardFooter}>
                <Text style={[styles.actionText, { color: theme.colors.textMuted }]}>
                  🔧 {item.actionTaken}
                </Text>
                {!item.isResolved ? (
                  <TouchableOpacity
                    style={[styles.resolveBtn, { backgroundColor: theme.colors.primary }]}
                    onPress={() => resolveAlert(item.id)}
                  >
                    <Text style={styles.resolveBtnText}>Dismiss</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resolvedText}>✓ Resolved</Text>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  sub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  refreshText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  alertCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
  },
  alertTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  alertMsg: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionText: {
    fontSize: 11,
  },
  resolveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadius.sm,
  },
  resolveBtnText: {
    color: '#FFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  resolvedText: {
    color: '#2E7D32',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});

