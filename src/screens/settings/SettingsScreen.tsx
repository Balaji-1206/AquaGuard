import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

import { Typography, Spacing } from '../../theme';

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useAppTheme();

  const [apiUrl, setApiUrl] = useState<string>('https://api.aquaguard.gov.in/v1');
  const [mqttUrl, setMqttUrl] = useState<string>('mqtts://broker.aquaguard.io:8883');
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Hindi'>('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3); // seconds
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  const handleSave = () => {
    Alert.alert('Settings Saved', 'System configurations updated successfully.');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>System Settings</Text>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          Configure IoT MQTT endpoints, data refresh timers & offline sync
        </Text>

        {/* Server & IoT Network Configs */}
        <View style={[styles.card, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            Endpoints & Protocol Configs
          </Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>FastAPI Backend URL</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC',
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
              },
            ]}
            value={apiUrl}
            onChangeText={setApiUrl}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>MQTT Broker Endpoint</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC',
                color: theme.colors.textPrimary,
                borderColor: theme.colors.border,
              },
            ]}
            value={mqttUrl}
            onChangeText={setMqttUrl}
          />
        </View>

        {/* Preference Settings */}
        <View style={[styles.card, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Preferences & Behavior</Text>

          {/* Theme Chooser */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Theme Mode</Text>
          <View style={styles.tabRow}>
            {(['light', 'dark', 'system'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.tabBtn,
                  themeMode === m && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setThemeMode(m)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: themeMode === m ? '#FFF' : theme.colors.textSecondary },
                  ]}
                >
                  {m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Language Selector */}
          <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: Spacing.sm }]}>
            Interface Language
          </Text>
          <View style={styles.tabRow}>
            {(['English', 'Tamil', 'Hindi'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.tabBtn,
                  language === lang && { backgroundColor: theme.colors.secondary },
                ]}
                onPress={() => setLanguage(lang)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: language === lang ? '#FFF' : theme.colors.textSecondary },
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Telemetry Refresh Interval */}
          <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: Spacing.sm }]}>
            MQTT Refresh Frequency: {refreshInterval} seconds
          </Text>
          <View style={styles.tabRow}>
            {[1, 3, 5, 10, 30].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.tabBtn,
                  refreshInterval === sec && { backgroundColor: theme.colors.primary },
                ]}
                onPress={() => setRefreshInterval(sec)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: refreshInterval === sec ? '#FFF' : theme.colors.textSecondary },
                  ]}
                >
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notification Switch */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
              Push Alerts for Contamination & Offline Nodes
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>

          {/* Offline Mode Switch */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
              Force Offline Mode (Use Cached Telemetry)
            </Text>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ true: theme.colors.primary }}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save Configuration</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.heavy,
  },
  sub: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.md,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Spacing.borderRadius.md,
    padding: 3,
    marginBottom: Spacing.xs,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.sm,
  },
  tabBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: Spacing.xs,
  },
  switchLabel: {
    fontSize: Typography.sizes.xs,
    flex: 0.85,
  },
  saveBtn: {
    height: 48,
    borderRadius: Spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
});

