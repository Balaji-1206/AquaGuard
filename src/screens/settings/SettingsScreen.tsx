import React, { useState, useEffect } from 'react';
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
import { useVoiceAlerts } from '../../context/VoiceAlertContext';
import { demoDataService } from '../../services/demoDataService';
import { DEMO_SCENARIOS } from '../../constants/demoMockData';
import { mqttSimulator } from '../../services/mqttSimulator';
import { Typography, Spacing } from '../../theme';
import { DemoScenarioName } from '../../types';

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useAppTheme();
  const { voiceEnabled, setVoiceEnabled, language, setLanguage, speakTestMessage } = useVoiceAlerts();

  const [apiUrl, setApiUrl] = useState<string>('https://api.aquaguard.gov.in/v1');
  const [mqttUrl, setMqttUrl] = useState<string>('mqtts://broker.aquaguard.io:8883');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<DemoScenarioName>('NORMAL_DAY');

  // Check backend connectivity on mount
  useEffect(() => {
    demoDataService.checkBackendConnectivity().then((live) => {
      setIsDemo(!live);
    });
  }, []);

  const handleSave = () => {
    Alert.alert('Settings Saved', 'System configurations updated successfully.');
  };

  const handleScenarioSelect = (scenarioName: DemoScenarioName) => {
    setActiveScenario(scenarioName);
    demoDataService.setScenario(scenarioName);
    mqttSimulator.setScenario(scenarioName);
    Alert.alert(
      '🎭 Demo Scenario Loaded',
      `${DEMO_SCENARIOS.find((s) => s.name === scenarioName)?.label} scenario is now active. Check the Dashboard.`
    );
  };

  const handleSimulateEvent = (type: 'FLOW_SPIKE' | 'TDS_SPIKE' | 'PH_DROP' | 'TURBIDITY_SPIKE') => {
    mqttSimulator.simulateAnomalyEvent(type);
    const labels: Record<string, string> = {
      FLOW_SPIKE:       '🚨 Flow Spike (14.8 L/min) — Pipe Leak',
      TDS_SPIKE:        '⚠️ TDS Spike (295 ppm) — Filter Alert',
      PH_DROP:          '🧪 pH Drop (5.7) — Acidic Water',
      TURBIDITY_SPIKE:  '🌧️ Turbidity Spike (4.8 NTU) — Sediment',
    };
    Alert.alert('Event Simulated', `${labels[type]}\n\nReading auto-reverts after 8 seconds.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>System Settings</Text>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
          Configure IoT MQTT endpoints, data refresh timers & offline sync
        </Text>

        {/* ── Live / Demo Mode Badge ───────────────────────────────────────── */}
        <View style={[styles.modeBadgeRow, { backgroundColor: isDemo ? '#FEF3C7' : '#DCFCE7', borderColor: isDemo ? '#F59E0B40' : '#22C55E40' }]}>
          <Text style={{ fontSize: 18 }}>{isDemo ? '🎭' : '📡'}</Text>
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={[styles.modeTitle, { color: isDemo ? '#92400E' : '#166534' }]}>
              {isDemo ? 'DEMO MODE — No Sensors Connected' : 'LIVE MODE — Backend Connected'}
            </Text>
            <Text style={[styles.modeSub, { color: isDemo ? '#B45309' : '#15803D' }]}>
              {isDemo
                ? 'Using simulated sensor data. Connect backend to go LIVE.'
                : 'Real-time ESP32 telemetry is streaming.'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.modeCheckBtn, { backgroundColor: isDemo ? '#F59E0B' : '#22C55E' }]}
            onPress={() => {
              demoDataService.checkBackendConnectivity().then((live) => {
                setIsDemo(!live);
                Alert.alert(live ? '✅ Live Mode' : '🎭 Demo Mode', live ? 'Backend is reachable!' : 'Backend not found. Using demo data.');
              });
            }}
          >
            <Text style={styles.modeCheckBtnText}>Re-check</Text>
          </TouchableOpacity>
        </View>

        {/* ── Demo Mode Scenarios ────────────────────────────────────────── */}
        {isDemo && (
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              🎭 Demo Scenarios
            </Text>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Select a Water Scenario</Text>
            {DEMO_SCENARIOS.map((scenario) => (
              <TouchableOpacity
                key={scenario.name}
                style={[
                  styles.scenarioRow,
                  {
                    backgroundColor: activeScenario === scenario.name
                      ? theme.colors.primary + '18'
                      : theme.isDark ? '#0F172A' : '#F8FAFC',
                    borderColor: activeScenario === scenario.name
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => handleScenarioSelect(scenario.name as DemoScenarioName)}
              >
                <Text style={styles.scenarioEmoji}>{scenario.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.scenarioLabel, { color: theme.colors.textPrimary }]}>
                    {scenario.label}
                  </Text>
                  <Text style={[styles.scenarioDesc, { color: theme.colors.textSecondary }]}>
                    {scenario.description}
                  </Text>
                </View>
                {activeScenario === scenario.name && (
                  <Text style={[styles.activeChip, { color: theme.colors.primary }]}>ACTIVE</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Anomaly Event Buttons */}
            <Text style={[styles.label, { color: theme.colors.textSecondary, marginTop: Spacing.sm }]}>
              Simulate One-Off Sensor Event
            </Text>
            <View style={styles.eventGrid}>
              {[
                { type: 'FLOW_SPIKE'      as const, label: '🚨 Flow Spike',    color: '#EF4444' },
                { type: 'TDS_SPIKE'       as const, label: '⚠️ TDS Spike',     color: '#F97316' },
                { type: 'PH_DROP'         as const, label: '🧪 pH Drop',        color: '#8B5CF6' },
                { type: 'TURBIDITY_SPIKE' as const, label: '🌧️ Turbidity',     color: '#0EA5E9' },
              ].map(({ type, label, color }) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.eventBtn, { backgroundColor: color + '18', borderColor: color + '40' }]}
                  onPress={() => handleSimulateEvent(type)}
                >
                  <Text style={[styles.eventBtnText, { color }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Server & IoT Network Configs ───────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            Endpoints & Protocol Configs
          </Text>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>FastAPI Backend URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC', color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
            value={apiUrl}
            onChangeText={setApiUrl}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>MQTT Broker Endpoint</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC', color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
            value={mqttUrl}
            onChangeText={setMqttUrl}
          />
        </View>

        {/* ── Preferences ─────────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>Preferences & Behavior</Text>

          {/* Theme Chooser */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Theme Mode</Text>
          <View style={styles.tabRow}>
            {(['light', 'dark', 'system'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tabBtn, themeMode === m && { backgroundColor: theme.colors.primary }]}
                onPress={() => setThemeMode(m)}
              >
                <Text style={[styles.tabBtnText, { color: themeMode === m ? '#FFF' : theme.colors.textSecondary }]}>
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
                style={[styles.tabBtn, language === lang && { backgroundColor: theme.colors.secondary }]}
                onPress={() => setLanguage(lang)}
              >
                <Text style={[styles.tabBtnText, { color: language === lang ? '#FFF' : theme.colors.textSecondary }]}>
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
                style={[styles.tabBtn, refreshInterval === sec && { backgroundColor: theme.colors.primary }]}
                onPress={() => setRefreshInterval(sec)}
              >
                <Text style={[styles.tabBtnText, { color: refreshInterval === sec ? '#FFF' : theme.colors.textSecondary }]}>
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Push Notifications */}
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

          {/* Offline Mode */}
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

        {/* ── Voice Alert Settings (Novelty 2) ────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            🗣️ Voice Alert System
          </Text>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Speaks CRITICAL and WARNING water alerts aloud in your chosen language.
          </Text>

          <View style={styles.switchRow}>
            <View style={{ flex: 0.85 }}>
              <Text style={[styles.switchLabel, { color: theme.colors.textPrimary }]}>
                Enable Voice Alerts
              </Text>
              <Text style={{ fontSize: 10, color: theme.colors.textMuted, marginTop: 1 }}>
                {voiceEnabled ? `Active — ${language} (CRITICAL interrupt, WARNING queued)` : 'Voice alerts are muted'}
              </Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ true: '#26A69A' }}
            />
          </View>

          {voiceEnabled && (
            <TouchableOpacity
              style={[styles.testVoiceBtn, { backgroundColor: '#26A69A18', borderColor: '#26A69A40' }]}
              onPress={speakTestMessage}
            >
              <Text style={{ fontSize: 16 }}>🔊</Text>
              <View style={{ marginLeft: Spacing.sm }}>
                <Text style={[styles.testVoiceBtnTitle, { color: '#26A69A' }]}>Test Voice Alert</Text>
                <Text style={[styles.testVoiceBtnSub, { color: theme.colors.textSecondary }]}>
                  Speaks in {language}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
  // Mode badge
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modeTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  modeSub: {
    fontSize: 10,
    marginTop: 1,
  },
  modeCheckBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: Spacing.sm,
  },
  modeCheckBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  cardSub: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.sm,
    lineHeight: 16,
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
  // Demo scenarios
  scenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  scenarioEmoji: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  scenarioLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  scenarioDesc: {
    fontSize: 10,
    marginTop: 1,
  },
  activeChip: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  eventBtn: {
    width: '48%',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  eventBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  // Voice alert section
  testVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  testVoiceBtnTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  testVoiceBtnSub: {
    fontSize: 10,
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
