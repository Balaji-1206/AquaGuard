import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

import { Typography, Spacing } from '../../theme';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme, theme } = useAppTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={[styles.userCard, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
          <View style={[styles.avatarBadge, { backgroundColor: theme.isDark ? '#1C2541' : '#E0F2FE' }]}>
            <Text style={{ fontSize: 32 }}>💧</Text>
          </View>

          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
            {user?.name || 'Balaji'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.roleText}>{user?.role || 'Home Owner'}</Text>
          </View>

          <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
            🏠 {user?.homeAddress || 'Villa 42, Palm Meadows, Chennai'}
          </Text>

          <View style={[styles.statusPill, { backgroundColor: '#10B98118' }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusPillText}>ALL HOME WATER ZONES SAFE</Text>
          </View>
        </View>

        {/* 2x2 Household Overview Quick Grid */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          Household Water Summary
        </Text>
        <View style={styles.gridContainer}>
          <View style={[styles.gridCard, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
            <Text style={{ fontSize: 20 }}>💧</Text>
            <Text style={[styles.gridValText, { color: '#10B981' }]}>99% Purity</Text>
            <Text style={[styles.gridLabelText, { color: theme.colors.textSecondary }]}>
              Kitchen RO
            </Text>
          </View>

          <View style={[styles.gridCard, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
            <Text style={{ fontSize: 20 }}>🏠</Text>
            <Text style={[styles.gridValText, { color: '#0EA5E9' }]}>85% Full</Text>
            <Text style={[styles.gridLabelText, { color: theme.colors.textSecondary }]}>
              Roof Tank
            </Text>
          </View>

          <View style={[styles.gridCard, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
            <Text style={{ fontSize: 20 }}>🚰</Text>
            <Text style={[styles.gridValText, { color: '#10B981' }]}>Valve Open</Text>
            <Text style={[styles.gridLabelText, { color: theme.colors.textSecondary }]}>
              Main Valve
            </Text>
          </View>

          <View style={[styles.gridCard, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
            <Text style={{ fontSize: 20 }}>📊</Text>
            <Text style={[styles.gridValText, { color: theme.colors.primary }]}>320 Liters</Text>
            <Text style={[styles.gridLabelText, { color: theme.colors.textSecondary }]}>
              Daily Usage
            </Text>
          </View>
        </View>

        {/* Monitored Zones */}
        <View style={[{ marginTop: Spacing.xs }, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 16}]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Monitored Smart Home Zones
          </Text>
          <View style={styles.villageChipsWrapper}>
            {user?.assignedZones.map((z: string) => (
              <View key={z} style={[styles.villageChip, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Text style={[styles.villageChipText, { color: theme.colors.primary }]}>📍 {z}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <View style={{backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, padding: 16, marginBottom: 12}}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>App Preferences</Text>

          <View style={styles.settingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginRight: Spacing.sm }}>
                {isDark ? '🌙' : '☀️'}
              </Text>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Dark Appearance Mode
              </Text>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.colors.primary }} />
          </View>

          <View style={styles.settingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginRight: Spacing.sm }}>🔔</Text>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Push Alerts & Reminders
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingRow}
            onPress={() => navigation.navigate('SettingsMain')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginRight: Spacing.sm }}>⚙️</Text>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Home Wi-Fi & Endpoint Settings
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: theme.colors.textMuted }}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 90,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatarBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  userName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadius.round,
    marginVertical: Spacing.xs,
  },
  roleText: {
    color: '#FFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  addressText: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadius.round,
    marginTop: Spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  gridCard: {
    width: '48.5%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xs,
  },
  gridValText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.heavy,
    marginTop: 4,
  },
  gridLabelText: {
    fontSize: 10,
    marginTop: 2,
  },
  villageChipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  villageChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Spacing.borderRadius.md,
  },
  villageChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});

