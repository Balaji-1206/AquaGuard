import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Animated,
} from 'react-native';
import Svg, {
  Line, Circle, Rect, Text as SvgText, G, Defs, LinearGradient as SvgGradient, Stop, Path, Polygon,
} from 'react-native-svg';
import { useAppTheme } from '../../context/ThemeContext';
import { useWaterData } from '../../hooks/useWaterData';
import { mockApi } from '../../services/mockApi';
import { mqttSimulator } from '../../services/mqttSimulator';
import { SmartWaterDevice } from '../../types';
import { Typography, Spacing } from '../../theme';

interface DevicesScreenProps {
  navigation: any;
}

export const DevicesScreen: React.FC<DevicesScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const { devices, liveReading, refreshData } = useWaterData();
  const [activeView, setActiveView] = useState<'diagram' | 'grid'>('diagram');
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('DEV-VALVE-03'); // Default: Sump Pump
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const selectedDevice = devices.find((d) => d.id === selectedNodeKey) || devices[0];

  const handleToggleValve = async (device: SmartWaterDevice) => {
    const targetState = device.valveState === 'OPEN' ? 'CLOSED' : 'OPEN';
    setTogglingId(device.id);
    try {
      await mockApi.toggleSmartValve(device.id, targetState);
      await refreshData();
      Alert.alert(
        `Valve ${targetState === 'OPEN' ? 'Opened 💧' : 'Closed 🚫'}`,
        `Smart Solenoid Valve for ${device.name} (${device.zone}) is now ${targetState}.`
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to command solenoid relay valve.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSimulateNodeAnomaly = (deviceId: string) => {
    if (deviceId === 'DEV-VALVE-03') {
      mqttSimulator.simulateAnomalyEvent('FLOW_SPIKE');
      Alert.alert('🚨 Pipe Leak Spike Simulated', '14.8 L/min flow rate spike injected into Underground Sump. Emergency shutoff triggered.');
    } else if (deviceId === 'DEV-RO-01') {
      mqttSimulator.simulateAnomalyEvent('TDS_SPIKE');
      Alert.alert('⚠️ RO TDS Contamination Simulated', '295 ppm TDS reading injected into Kitchen RO Purifier outlet.');
    } else if (deviceId === 'DEV-TANK-02') {
      mqttSimulator.simulateAnomalyEvent('TURBIDITY_SPIKE');
      Alert.alert('🌧️ Tank Sediment Influx Simulated', '4.8 NTU post-rain turbidity spike injected into Overhead Roof Tank.');
    } else {
      mqttSimulator.simulateAnomalyEvent('PH_DROP');
      Alert.alert('🧪 Acidic pH Anomaly Simulated', '5.7 pH level drop injected into Bathroom Supply unit.');
    }
  };

  // Node definitions for SVG Map
  const mapNodes = [
    { key: 'DEV-VALVE-03', name: 'Sump Pump', subtitle: 'Sump & Valve', icon: '⚙️', x: 230, y: 55, color: '#0EA5E9', pctX: 67.6, pctY: 15.2 },
    { key: 'DEV-TANK-02',  name: 'Roof Tank', subtitle: 'Storage 85%', icon: '🏠', x: 230, y: 175, color: '#26A69A', pctX: 67.6, pctY: 48.6 },
    { key: 'DEV-RO-01',    name: 'Kitchen RO', subtitle: 'Drinking Line', icon: '💧', x: 90, y: 290, color: '#22C55E', pctX: 26.5, pctY: 80.5 },
    { key: 'DEV-BATH-04',  name: 'Bathroom',  subtitle: 'Softener Line', icon: '🚿', x: 250, y: 290, color: '#8B5CF6', pctX: 73.5, pctY: 80.5 },
  ];

  const mainValveClosed = devices.find((d) => d.id === 'DEV-VALVE-03')?.valveState === 'CLOSED';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Segment Bar */}
      <View style={[styles.segmentBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeView === 'diagram' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveView('diagram')}
        >
          <Text
            style={[
              styles.segmentText,
              { color: activeView === 'diagram' ? '#FFF' : theme.colors.textSecondary },
            ]}
          >
            🗺️ House Pipeline Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeView === 'grid' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveView('grid')}
        >
          <Text
            style={[
              styles.segmentText,
              { color: activeView === 'grid' ? '#FFF' : theme.colors.textSecondary },
            ]}
          >
            🔌 Smart Devices Grid
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── HOUSE PIPELINE MAP VIEW ───────────────────────────────────────── */}
        {activeView === 'diagram' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Household Water Network
              </Text>
              <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
                Interactive flow map · Tap any node or pill below to select
              </Text>
            </View>

            {/* ── Node Quick Selector Bar ── */}
            <View style={styles.nodeSelectorBar}>
              {mapNodes.map((n) => {
                const isSel = selectedNodeKey === n.key;
                return (
                  <TouchableOpacity
                    key={n.key}
                    activeOpacity={0.7}
                    style={[
                      styles.nodeChipBtn,
                      {
                        backgroundColor: isSel ? theme.colors.primary : theme.isDark ? '#1E293B' : '#F1F5F9',
                        borderColor: isSel ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedNodeKey(n.key)}
                  >
                    <Text style={{ fontSize: 13 }}>{n.icon}</Text>
                    <Text style={[styles.nodeChipText, { color: isSel ? '#FFF' : theme.colors.textPrimary }]}>
                      {n.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Blueprint SVG Canvas Deck ── */}
            <View
              style={[
                styles.mapDeck,
                {
                  backgroundColor: theme.isDark ? '#0B132B' : '#0F172A',
                  borderColor: theme.isDark ? '#1E293B' : '#334155',
                },
              ]}
            >
              <Svg width="100%" height={360} viewBox="0 0 340 360">
                <Defs>
                  <SvgGradient id="waterFlowGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#38BDF8" />
                    <Stop offset="100%" stopColor="#0284C7" />
                  </SvgGradient>

                  <SvgGradient id="stopFlowGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0%" stopColor="#EF4444" />
                    <Stop offset="100%" stopColor="#991B1B" />
                  </SvgGradient>
                </Defs>

                {/* Grid Blueprint Guidelines */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <Line
                    key={`h-${i}`}
                    x1={0} y1={i * 40}
                    x2={340} y2={i * 40}
                    stroke="#1E293B" strokeWidth={0.5} strokeDasharray="3,6"
                  />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <Line
                    key={`v-${i}`}
                    x1={i * 45} y1={0}
                    x2={i * 45} y2={360}
                    stroke="#1E293B" strokeWidth={0.5} strokeDasharray="3,6"
                  />
                ))}

                {/* ── PIPELINES ── */}

                {/* Line 1: Municipal (70,55) → Sump Pump (230,55) */}
                <Path
                  d="M 70 55 L 230 55"
                  stroke="url(#waterFlowGrad)"
                  strokeWidth={6}
                  strokeLinecap="round"
                />
                <Polygon points="150,50 160,55 150,60" fill="#38BDF8" />

                {/* Line 2: Sump Pump (230,55) → Roof Tank (230,175) */}
                <Path
                  d="M 230 55 L 230 175"
                  stroke={mainValveClosed ? "url(#stopFlowGrad)" : "url(#waterFlowGrad)"}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={mainValveClosed ? "4,4" : undefined}
                />
                {!mainValveClosed && <Polygon points="225,115 230,125 235,115" fill="#38BDF8" />}
                {mainValveClosed && (
                  <G>
                    <Circle cx={230} cy={115} r={10} fill="#EF4444" />
                    <SvgText x={230} y={119} fontSize={10} fill="#FFF" fontWeight="bold" textAnchor="middle">✕</SvgText>
                  </G>
                )}

                {/* Line 3: Roof Tank (230,175) → Kitchen RO (90,290) */}
                <Path
                  d="M 230 175 L 230 225 L 90 225 L 90 290"
                  stroke={mainValveClosed ? "url(#stopFlowGrad)" : "#22C55E"}
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
                {!mainValveClosed && <Polygon points="150,220 140,225 150,230" fill="#22C55E" />}

                {/* Line 4: Roof Tank (230,175) → Bathroom Softener (250,290) */}
                <Path
                  d="M 230 175 L 230 225 L 250 225 L 250 290"
                  stroke={mainValveClosed ? "url(#stopFlowGrad)" : "#8B5CF6"}
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
                {!mainValveClosed && <Polygon points="245,255 250,265 255,255" fill="#8B5CF6" />}

                {/* ── MUNICIPAL HEADER NODE ── */}
                <G>
                  <Circle cx={70} cy={55} r={24} fill="#0F172A" stroke="#0EA5E9" strokeWidth={2} />
                  <SvgText x={70} y={61} fontSize={18} textAnchor="middle">🏛️</SvgText>
                  <SvgText x={70} y={95} fontSize={10} fill="#F8FAFC" fontWeight="bold" textAnchor="middle">Municipal</SvgText>
                  <SvgText x={70} y={106} fontSize={8} fill="#94A3B8" textAnchor="middle">City Main</SvgText>
                </G>

                {/* ── NODES RENDERED ── */}
                {mapNodes.map((n) => {
                  const isSelected = selectedNodeKey === n.key;
                  const dev = devices.find((d) => d.id === n.key);
                  const isClosed = dev?.valveState === 'CLOSED';
                  const ringColor = isClosed ? '#EF4444' : isSelected ? '#38BDF8' : n.color;

                  return (
                    <G key={n.key}>
                      {/* Selection Glow Ring */}
                      {isSelected && (
                        <Circle
                          cx={n.x} cy={n.y} r={32}
                          fill="none" stroke="#38BDF8"
                          strokeWidth={2.5} strokeDasharray="5,4"
                        />
                      )}

                      {/* Main Node Circle */}
                      <Circle
                        cx={n.x} cy={n.y} r={24}
                        fill={isSelected ? '#1E293B' : '#0F172A'}
                        stroke={ringColor}
                        strokeWidth={isSelected ? 3 : 2}
                      />

                      {/* Emoji Icon */}
                      <SvgText x={n.x} y={n.y + 6} fontSize={18} textAnchor="middle">
                        {n.icon}
                      </SvgText>

                      {/* Label below node */}
                      <SvgText
                        x={n.x} y={n.y + 40}
                        fontSize={10}
                        fill={isSelected ? '#38BDF8' : '#F8FAFC'}
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {n.name}
                      </SvgText>

                      {/* Subtitle / Status line */}
                      <SvgText
                        x={n.x} y={n.y + 51}
                        fontSize={8}
                        fill={isClosed ? '#EF4444' : '#94A3B8'}
                        textAnchor="middle"
                      >
                        {isClosed ? '🚫 VALVE CLOSED' : n.subtitle}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>

              {/* ── ABSOLUTE TOUCH OVERLAYS OVER SVG NODES (Ensures 100% Web & Mobile Clickability) ── */}
              {mapNodes.map((n) => (
                <TouchableOpacity
                  key={`overlay-${n.key}`}
                  activeOpacity={0.6}
                  style={[
                    styles.nodeTouchTarget,
                    {
                      left: `${n.pctX}%`,
                      top: `${n.pctY}%`,
                    },
                  ]}
                  onPress={() => setSelectedNodeKey(n.key)}
                />
              ))}

              <View style={styles.deckFooter}>
                <View style={styles.deckLegendItem}>
                  <View style={[styles.deckDot, { backgroundColor: '#38BDF8' }]} />
                  <Text style={styles.deckLegendText}>Active Flow</Text>
                </View>
                <View style={styles.deckLegendItem}>
                  <View style={[styles.deckDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.deckLegendText}>Valve Closed</Text>
                </View>
              </View>
            </View>

            {/* ── SELECTED NODE INTERACTIVE DIAGNOSTIC CARD ───────────────── */}
            {selectedDevice && (
              <View
                style={[
                  styles.nodeControlCard,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: selectedDevice.valveState === 'CLOSED' ? '#EF4444' : theme.colors.primary,
                  },
                ]}
              >
                {/* Node Title & Status */}
                <View style={styles.nodeHeaderRow}>
                  <View style={styles.nodeTitleBlock}>
                    <Text style={styles.nodeEmoji}>
                      {selectedDevice.zone === 'Kitchen RO Purifier' ? '💧' :
                       selectedDevice.zone === 'Overhead Roof Tank' ? '🏠' :
                       selectedDevice.zone === 'Underground Sump' ? '⚙️' : '🚿'}
                    </Text>
                    <View>
                      <Text style={[styles.nodeTitle, { color: theme.colors.textPrimary }]}>
                        {selectedDevice.name}
                      </Text>
                      <Text style={[styles.nodeSub, { color: theme.colors.textSecondary }]}>
                        📍 {selectedDevice.location} · {selectedDevice.zone}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.onlineBadge, { backgroundColor: selectedDevice.status === 'ONLINE' ? '#22C55E20' : '#EF444420' }]}>
                    <View style={[styles.statusDot, { backgroundColor: selectedDevice.status === 'ONLINE' ? '#22C55E' : '#EF4444' }]} />
                    <Text style={[styles.onlineText, { color: selectedDevice.status === 'ONLINE' ? '#22C55E' : '#EF4444' }]}>
                      {selectedDevice.status}
                    </Text>
                  </View>
                </View>

                {/* Telemetry Sensor Chips */}
                <View style={styles.nodeTelemetryGrid}>
                  <View style={[styles.metricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>pH Level</Text>
                    <Text style={[styles.metricVal, { color: '#0EA5E9' }]}>{liveReading.pH} pH</Text>
                  </View>

                  <View style={[styles.metricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>TDS Solids</Text>
                    <Text style={[styles.metricVal, { color: '#26A69A' }]}>{liveReading.tds} ppm</Text>
                  </View>

                  <View style={[styles.metricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>Turbidity</Text>
                    <Text style={[styles.metricVal, { color: '#8B5CF6' }]}>{liveReading.turbidity} NTU</Text>
                  </View>

                  <View style={[styles.metricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>Flow Rate</Text>
                    <Text style={[styles.metricVal, { color: liveReading.flowRate > 10 ? '#EF4444' : '#22C55E' }]}>
                      {liveReading.flowRate} L/m
                    </Text>
                  </View>
                </View>

                {/* Solenoid Valve Control Row */}
                <View style={[styles.nodeValveRow, { borderColor: theme.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.nodeValveLabel, { color: theme.colors.textPrimary }]}>
                      Solenoid Relay Valve Shutoff
                    </Text>
                    <Text
                      style={[
                        styles.nodeValveStatus,
                        { color: selectedDevice.valveState === 'OPEN' ? '#22C55E' : '#EF4444' },
                      ]}
                    >
                      {selectedDevice.valveState === 'OPEN'
                        ? '💧 OPEN — Water Flowing'
                        : '🚫 CLOSED — Emergency Shutoff Active'}
                    </Text>
                  </View>

                  <Switch
                    value={selectedDevice.valveState === 'OPEN'}
                    onValueChange={() => handleToggleValve(selectedDevice)}
                    disabled={togglingId === selectedDevice.id}
                    trackColor={{ true: '#22C55E', false: '#EF4444' }}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.nodeBtn, { backgroundColor: theme.colors.primary + '18', borderColor: theme.colors.primary + '40' }]}
                    onPress={() => handleSimulateNodeAnomaly(selectedDevice.id)}
                  >
                    <Text style={[styles.nodeBtnText, { color: theme.colors.primary }]}>
                      ⚡ Simulate Anomaly Event
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.nodeBtn, { backgroundColor: '#8B5CF618', borderColor: '#8B5CF640' }]}
                    onPress={() => navigation.navigate('AnalyticsTab')}
                  >
                    <Text style={[styles.nodeBtnText, { color: '#8B5CF6' }]}>
                      📈 Live Waveform →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── SMART DEVICES GRID VIEW ────────────────────────────────────── */}
        {activeView === 'grid' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Active Node Network ({devices.length})
              </Text>
              <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
                Real-time ESP32 & Relay Controllers
              </Text>
            </View>

            <View style={styles.gridContainer}>
              {devices.map((device) => {
                const isOnline = device.status === 'ONLINE';
                const isValveOpen = device.valveState === 'OPEN';

                return (
                  <View
                    key={device.id}
                    style={[
                      styles.deviceCard,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: isOnline ? theme.colors.border : '#EF444450',
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.statusBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: isOnline ? '#22C55E' : '#EF4444' },
                          ]}
                        />
                        <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                          {device.status}
                        </Text>
                      </View>

                      <View style={styles.telemetryInfo}>
                        <Text style={styles.telemetryText}>🔋 {device.battery}%</Text>
                        <Text style={styles.telemetryText}>📶 {device.wifiSignal} dBm</Text>
                      </View>
                    </View>

                    <Text style={styles.deviceEmoji}>
                      {device.zone === 'Kitchen RO Purifier' ? '💧' :
                       device.zone === 'Overhead Roof Tank' ? '🏠' :
                       device.zone === 'Underground Sump' ? '⚙️' : '🚿'}
                    </Text>

                    <Text style={[styles.deviceName, { color: theme.colors.textPrimary }]}>
                      {device.name}
                    </Text>
                    <Text style={[styles.deviceZone, { color: theme.colors.textSecondary }]}>
                      📍 {device.location}
                    </Text>

                    <View style={styles.readingsRow}>
                      <View style={[styles.chip, { backgroundColor: theme.isDark ? '#0F172A' : '#F1F5F9' }]}>
                        <Text style={[styles.chipLabel, { color: theme.colors.textMuted }]}>pH</Text>
                        <Text style={[styles.chipVal, { color: '#0EA5E9' }]}>{device.readings.pH}</Text>
                      </View>

                      <View style={[styles.chip, { backgroundColor: theme.isDark ? '#0F172A' : '#F1F5F9' }]}>
                        <Text style={[styles.chipLabel, { color: theme.colors.textMuted }]}>TDS</Text>
                        <Text style={[styles.chipVal, { color: '#26A69A' }]}>{device.readings.tds} <Text style={{ fontSize: 8 }}>ppm</Text></Text>
                      </View>

                      <View style={[styles.chip, { backgroundColor: theme.isDark ? '#0F172A' : '#F1F5F9' }]}>
                        <Text style={[styles.chipLabel, { color: theme.colors.textMuted }]}>Flow</Text>
                        <Text style={[styles.chipVal, { color: device.readings.flowRate > 10 ? '#EF4444' : '#22C55E' }]}>
                          {device.readings.flowRate} <Text style={{ fontSize: 8 }}>L/m</Text>
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.valveRow, { borderColor: theme.colors.border }]}>
                      <View>
                        <Text style={[styles.valveLabel, { color: theme.colors.textPrimary }]}>
                          Solenoid Valve
                        </Text>
                        <Text
                          style={[
                            styles.valveStateText,
                            { color: isValveOpen ? '#22C55E' : '#EF4444' },
                          ]}
                        >
                          {isValveOpen ? 'OPEN (Water Flowing)' : 'CLOSED (Shutoff)'}
                        </Text>
                      </View>

                      <Switch
                        value={isValveOpen}
                        onValueChange={() => handleToggleValve(device)}
                        disabled={togglingId === device.id}
                        trackColor={{ true: '#22C55E', false: '#EF4444' }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.sm,
  },
  segmentText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sectionSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },

  // Quick Selector Chips Bar
  nodeSelectorBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  nodeChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  nodeChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Futuristic Blueprint Deck
  mapDeck: {
    position: 'relative',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.md,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  nodeTouchTarget: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: -30,
    marginTop: -30,
    zIndex: 99,
  },
  deckFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  deckLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  deckDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deckLegendText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },

  // Selected Node Diagnostic Card
  nodeControlCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  nodeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  nodeTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  nodeEmoji: {
    fontSize: 28,
  },
  nodeTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  nodeSub: {
    fontSize: 10,
    marginTop: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  nodeTelemetryGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  metricChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  nodeValveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.xs + 4,
    marginBottom: Spacing.sm,
  },
  nodeValveLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  nodeValveStatus: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  nodeBtn: {
    flex: 1,
    paddingVertical: Spacing.xs + 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  nodeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Devices Grid View
  gridContainer: {
    gap: Spacing.md,
  },
  deviceCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  telemetryInfo: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  telemetryText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  deviceEmoji: {
    fontSize: 28,
    marginVertical: 4,
  },
  deviceName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  deviceZone: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.sm,
  },
  readingsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  chipLabel: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chipVal: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  valveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  valveLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  valveStateText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
});
