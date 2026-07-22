import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';

interface HeaderProps {
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNotificationPress }) => {
  const { user } = useAuth();
  const { unresolvedCount } = useNotifications();
  const { theme } = useAppTheme();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.userRow}>
        <View style={[styles.avatarBadge, { backgroundColor: theme.isDark ? '#1C2541' : '#E0F2FE' }]}>
          <Text style={{ fontSize: 22 }}>💧</Text>
        </View>
        <View style={styles.userTextWrapper}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.brandText, { color: theme.colors.primary }]}>AquaGuard</Text>
            <View style={styles.hydroBadge}>
              <Text style={styles.hydroBadgeText}>HYDRO</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
            Welcome, {user?.name || 'Balaji'} 👋
          </Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.bellBtn,
            { backgroundColor: theme.colors.card, borderColor: theme.isDark ? '#3A506B' : '#BAE6FD' },
          ]}
          onPress={onNotificationPress}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          {unresolvedCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{unresolvedCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  userTextWrapper: {
    marginLeft: Spacing.sm,
  },
  brandText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.heavy,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hydroBadge: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  hydroBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
