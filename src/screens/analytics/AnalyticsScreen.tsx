import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Dimensions, Alert,
} from 'react-native';
import Svg, { Circle, G, Text as SvgText, Line, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { useWaterData } from '../../hooks/useWaterData';
import { mockApi } from '../../services/mockApi';
import { mqttSimulator } from '../../services/mqttSimulator';
import { useVoiceAlerts } from '../../context/VoiceAlertContext';
import { SENSOR_THRESHOLDS } from '../../constants/thresholds';
import { Typography, Spacing } from '../../theme';

const SCREEN_W = Dimensions.get('window').width;

// ─── Circular Gauge ───────────────────────────────────────────────────────────
interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  icon: string;
  color: string;
  warningColor?: string;
  isWarning?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
  size?: number;
}

const CircularGauge: React.FC<GaugeProps> = ({
  value, min, max, label, unit, icon, color, warningColor = '#F97316',
  isWarning = false, isSelected = false, onPress, size = 110,
}) => {
  const { theme } = useAppTheme();
  const animVal = useRef(new Animated.Value(0)).current;
  const R = size / 2 - 10;
  const circumference = 2 * Math.PI * R;
  const clampedVal = Math.max(min, Math.min(max, value));
  const pct = (clampedVal - min) / (max - min);
  const displayColor = isWarning ? warningColor : color;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.gaugeCard,
        {
          backgroundColor: theme.colors.card,
          borderColor: isSelected ? displayColor : isWarning ? warningColor + '60' : theme.colors.border,
          borderWidth: isSelected ? 2.5 : 1,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc track */}
        <Circle
          cx={cx} cy={cy} r={R}
          stroke={theme.isDark ? '#334155' : '#E2E8F0'}
          strokeWidth={8}
          fill="none"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={circumference * 0.125}
          strokeLinecap="round"
          rotation={135}
          origin={`${cx},${cy}`}
        />
        {/* Value arc */}
        <Circle
          cx={cx} cy={cy} r={R}
          stroke={displayColor}
          strokeWidth={8}
          fill="none"
          strokeDasharray={`${circumference * 0.75 * pct} ${circumference * (1 - 0.75 * pct)}`}
          strokeDashoffset={circumference * 0.125}
          strokeLinecap="round"
          rotation={135}
          origin={`${cx},${cy}`}
        />
        {/* Center value */}
        <SvgText
          x={cx} y={cy - 6}
          textAnchor="middle"
          fontSize={size < 100 ? 14 : 17}
          fontWeight="800"
          fill={displayColor}
        >
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
        </SvgText>
        <SvgText
          x={cx} y={cy + 10}
          textAnchor="middle"
          fontSize={9}
          fill={theme.isDark ? '#64748B' : '#94A3B8'}
        >
          {unit}
        </SvgText>
      </Svg>

      <View style={styles.gaugeLabelRow}>
        <Text style={{ fontSize: 14 }}>{icon}</Text>
        <Text style={[styles.gaugeLabel, { color: isSelected ? displayColor : theme.colors.textPrimary }]}>
          {label}
        </Text>
      </View>

      {isWarning && (
        <View style={[styles.warningPill, { backgroundColor: warningColor + '20' }]}>
          <Text style={[styles.warningPillText, { color: warningColor }]}>⚠ OUT OF RANGE</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Live Waveform Bar ────────────────────────────────────────────────────────
interface WaveBarProps {
  readings: number[];
  color: string;
  height: number;
  maxVal: number;
}
const WaveBar: React.FC<WaveBarProps> = ({ readings, color, height, maxVal }) => {
  const w = (SCREEN_W - Spacing.md * 4) / readings.length;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${readings.length * w} ${height}`}>
      {readings.map((v, i) => {
        const barH = Math.max(2, (v / maxVal) * (height - 8));
        return (
          <Rect
            key={i}
            x={i * w + 1}
            y={height - barH}
            width={w - 2}
            height={barH}
            rx={2}
            fill={color}
            opacity={0.5 + (i / readings.length) * 0.5}
          />
        );
      })}
    </Svg>
  );
};

// ─── Interactive Historical Bar Chart ────────────────────────────────────────
interface HistoricalChartProps {
  data: { label: string; value: number }[];
  color: string;
  maxVal: number;
  unit: string;
  title: string;
  icon: string;
  selectedBarIdx: number | null;
  onSelectBar: (idx: number) => void;
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({
  data, color, maxVal, unit, title, icon, selectedBarIdx, onSelectBar,
}) => {
  const { theme } = useAppTheme();
  const barW = Math.floor((SCREEN_W - Spacing.md * 5) / data.length);
  const chartH = 85;

  return (
    <View style={[styles.histCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.histHeader}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={[styles.histTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
        <View style={[styles.unitPill, { backgroundColor: color + '20' }]}>
          <Text style={[styles.unitPillText, { color }]}>{unit}</Text>
        </View>
      </View>

      <Svg width="100%" height={chartH + 20}>
        {data.map((d, i) => {
          const barH = Math.max(4, (d.value / maxVal) * chartH);
          const x    = i * barW + 2;
          const isSelected = selectedBarIdx === i;

          return (
            <G key={i} onPress={() => onSelectBar(i)}>
              <Rect
                x={x} y={chartH - barH}
                width={barW - 4} height={barH}
                rx={4}
                fill={isSelected ? '#38BDF8' : color}
                opacity={isSelected ? 1 : 0.65 + (i / data.length) * 0.35}
                stroke={isSelected ? '#FFF' : undefined}
                strokeWidth={isSelected ? 1.5 : 0}
              />
              <SvgText
                x={x + (barW - 4) / 2}
                y={chartH + 13}
                textAnchor="middle"
                fontSize={8}
                fill={isSelected ? theme.colors.primary : theme.colors.textMuted}
                fontWeight={isSelected ? 'bold' : 'normal'}
              >
                {d.label}
              </SvgText>
            </G>
          );
        })}
        {/* Baseline */}
        <Line
          x1={0} y1={chartH}
          x2={(data.length) * barW} y2={chartH}
          stroke={theme.isDark ? '#334155' : '#E2E8F0'}
          strokeWidth={1}
        />
      </Svg>

      <View style={styles.histStats}>
        <Text style={[styles.histStat, { color: theme.colors.textSecondary }]}>
          Min: <Text style={{ color, fontWeight: '700' }}>{Math.min(...data.map(d => d.value)).toFixed(1)}</Text>
        </Text>
        <Text style={[styles.histStat, { color: theme.colors.textSecondary }]}>
          Avg: <Text style={{ color, fontWeight: '700' }}>
            {(data.reduce((a, d) => a + d.value, 0) / data.length).toFixed(1)}
          </Text>
        </Text>
        <Text style={[styles.histStat, { color: theme.colors.textSecondary }]}>
          Max: <Text style={{ color, fontWeight: '700' }}>{Math.max(...data.map(d => d.value)).toFixed(1)}</Text>
        </Text>
      </View>
    </View>
  );
};

// ─── Main Analytics Screen ────────────────────────────────────────────────────
export const AnalyticsScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const { liveReading, connectionStatus } = useWaterData();
  const { speakCustomText, language } = useVoiceAlerts();

  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [selectedSensorKey, setSelectedSensorKey] = useState<'pH' | 'tds' | 'temperature' | 'turbidity' | 'flow'>('pH');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [waveFilter, setWaveFilter] = useState<'ALL' | 'pH' | 'tds' | 'turbidity'>('ALL');

  const [histPeriod, setHistPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [histData, setHistData] = useState<any[]>([]);
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(0);

  // Peak hold values
  const peakHold = useRef<{ pHMin: number; pHMax: number; tdsMin: number; tdsMax: number }>({
    pHMin: 7.2, pHMax: 7.2, tdsMin: 85, tdsMax: 85,
  });

  // Update peak holds
  if (liveReading.pH < peakHold.current.pHMin) peakHold.current.pHMin = liveReading.pH;
  if (liveReading.pH > peakHold.current.pHMax) peakHold.current.pHMax = liveReading.pH;
  if (liveReading.tds < peakHold.current.tdsMin) peakHold.current.tdsMin = liveReading.tds;
  if (liveReading.tds > peakHold.current.tdsMax) peakHold.current.tdsMax = liveReading.tds;

  // Sliding waveform buffer (last 12 readings)
  const waveBuffer = useRef<{ pH: number[]; tds: number[]; turbidity: number[] }>({
    pH: Array(12).fill(7.2),
    tds: Array(12).fill(85),
    turbidity: Array(12).fill(0.2),
  });

  useEffect(() => {
    if (isPaused) return;
    waveBuffer.current.pH = [...waveBuffer.current.pH.slice(1), liveReading.pH];
    waveBuffer.current.tds = [...waveBuffer.current.tds.slice(1), liveReading.tds];
    waveBuffer.current.turbidity = [...waveBuffer.current.turbidity.slice(1), liveReading.turbidity];
  }, [liveReading, isPaused]);

  useEffect(() => {
    mockApi.fetchHistoricalData(histPeriod).then((data) => {
      setHistData(data);
      setSelectedBarIdx(0);
    });
  }, [histPeriod]);

  // Derive warning states
  const phWarning  = liveReading.pH < SENSOR_THRESHOLDS.pH.minWarning || liveReading.pH > SENSOR_THRESHOLDS.pH.maxWarning;
  const tdsWarning = liveReading.tds > SENSOR_THRESHOLDS.tds.maxWarning;
  const turbWarn   = liveReading.turbidity > SENSOR_THRESHOLDS.turbidity.maxWarning;

  const handleAnnounceReading = (metricName: string, val: number, unit: string) => {
    speakCustomText(`${metricName} reading is currently ${val} ${unit}.`);
    Alert.alert('🔊 Voice Announcement', `Speaking: "${metricName} reading is currently ${val} ${unit}."`);
  };

  const handleSimulateMetricSpike = (key: string) => {
    if (key === 'pH') {
      mqttSimulator.simulateAnomalyEvent('PH_DROP');
      Alert.alert('🧪 pH Anomaly Triggered', 'Simulated acidic pH drop (5.7 pH). Reverts in 8s.');
    } else if (key === 'tds') {
      mqttSimulator.simulateAnomalyEvent('TDS_SPIKE');
      Alert.alert('⚠️ TDS Contamination Triggered', 'Simulated TDS spike (295 ppm). Reverts in 8s.');
    } else if (key === 'turbidity') {
      mqttSimulator.simulateAnomalyEvent('TURBIDITY_SPIKE');
      Alert.alert('🌧️ Sediment Influx Triggered', 'Simulated turbidity spike (4.8 NTU). Reverts in 8s.');
    } else if (key === 'flow') {
      mqttSimulator.simulateAnomalyEvent('FLOW_SPIKE');
      Alert.alert('🚨 Flow Rate Leak Triggered', 'Simulated 14.8 L/min pipe leak. Reverts in 8s.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Segment Bar */}
      <View style={[styles.segmentBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'live' && { backgroundColor: theme.colors.primary }]}
          onPress={() => setActiveTab('live')}
        >
          <Text style={[styles.segmentText, { color: activeTab === 'live' ? '#FFF' : theme.colors.textSecondary }]}>
            ⚡ Live Telemetry Gauges
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'history' && { backgroundColor: theme.colors.primary }]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.segmentText, { color: activeTab === 'history' ? '#FFF' : theme.colors.textSecondary }]}>
            📊 Historical Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── LIVE TELEMETRY TAB ─────────────────────────────────────────── */}
      {activeTab === 'live' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Connection Status & Stream Controls Bar */}
          <View style={styles.streamControlBar}>
            <LinearGradient
              colors={theme.isDark ? ['#1E293B', '#0F172A'] : ['#0284C7', '#0EA5E9']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.statusBanner}
            >
              <View style={[styles.statusDot, { backgroundColor: isPaused ? '#F59E0B' : '#34D399' }]} />
              <Text style={styles.statusText}>
                {isPaused ? '⏸️ Stream Paused' : connectionStatus.esp32Status === 'ONLINE' ? 'ESP32 Live Stream' : 'MQTT Stream (3s)'}
              </Text>
            </LinearGradient>

            <TouchableOpacity
              style={[styles.pauseBtn, { backgroundColor: isPaused ? '#22C55E' : '#EF4444' }]}
              onPress={() => setIsPaused(!isPaused)}
            >
              <Text style={styles.pauseBtnText}>{isPaused ? '▶️ Resume' : '⏸️ Pause'}</Text>
            </TouchableOpacity>
          </View>

          {/* Gauge Grid — 2×2 */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Real-Time Sensor Gauges
            </Text>
            <Text style={[styles.tapHintText, { color: theme.colors.textSecondary }]}>
              Tap gauge to inspect & trigger
            </Text>
          </View>

          <View style={styles.gaugeGrid}>
            <CircularGauge
              value={liveReading.pH} min={0} max={14}
              label="pH Level" unit="pH" icon="🧪"
              color="#0EA5E9" warningColor="#EF4444" isWarning={phWarning}
              isSelected={selectedSensorKey === 'pH'}
              onPress={() => setSelectedSensorKey('pH')}
            />
            <CircularGauge
              value={liveReading.tds} min={0} max={500}
              label="TDS Solids" unit="ppm" icon="💧"
              color="#26A69A" warningColor="#F97316" isWarning={tdsWarning}
              isSelected={selectedSensorKey === 'tds'}
              onPress={() => setSelectedSensorKey('tds')}
            />
            <CircularGauge
              value={liveReading.temperature} min={15} max={40}
              label="Temperature" unit="°C" icon="🌡️"
              color="#F9A825" warningColor="#EF4444" isWarning={false}
              isSelected={selectedSensorKey === 'temperature'}
              onPress={() => setSelectedSensorKey('temperature')}
            />
            <CircularGauge
              value={liveReading.turbidity} min={0} max={5}
              label="Turbidity" unit="NTU" icon="🌊"
              color="#8B5CF6" warningColor="#EF4444" isWarning={turbWarn}
              isSelected={selectedSensorKey === 'turbidity'}
              onPress={() => setSelectedSensorKey('turbidity')}
            />
          </View>

          {/* Flow Rate Gauge Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedSensorKey('flow')}
            style={[
              styles.flowCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: selectedSensorKey === 'flow' ? '#22C55E' : liveReading.flowRate > 10 ? '#EF444450' : theme.colors.border,
                borderWidth: selectedSensorKey === 'flow' ? 2 : 1,
              },
            ]}
          >
            <View style={styles.flowLeft}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 18 }}>⚡</Text>
                <Text style={[styles.gaugeLabel, { color: theme.colors.textPrimary }]}>Flow Rate Monitor</Text>
              </View>

              <Text style={[styles.flowVal, { color: liveReading.flowRate > 10 ? '#EF4444' : '#22C55E' }]}>
                {liveReading.flowRate.toFixed(1)} <Text style={{ fontSize: 16 }}>L/m</Text>
              </Text>

              {liveReading.flowRate > 10 && (
                <View style={[styles.warningPill, { backgroundColor: '#EF444420', marginTop: 4, alignSelf: 'flex-start' }]}>
                  <Text style={[styles.warningPillText, { color: '#EF4444' }]}>🚨 LEAK THRESHOLD EXCEEDED</Text>
                </View>
              )}
            </View>

            <View style={styles.flowBarCol}>
              <View style={[styles.flowTrack, { backgroundColor: theme.isDark ? '#334155' : '#E2E8F0' }]}>
                <View style={[
                  styles.flowFill,
                  {
                    height: `${Math.min(100, (liveReading.flowRate / 15) * 100)}%`,
                    backgroundColor: liveReading.flowRate > 10 ? '#EF4444' : '#22C55E',
                  },
                ]} />
              </View>
              <Text style={[styles.flowBarLabel, { color: theme.colors.textMuted }]}>15 L/m max</Text>
            </View>
          </TouchableOpacity>

          {/* ── INTERACTIVE SELECTED SENSOR INSPECTOR CARD ────────────────── */}
          <View style={[styles.inspectorCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
            <View style={styles.inspectorHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24 }}>
                  {selectedSensorKey === 'pH' ? '🧪' :
                   selectedSensorKey === 'tds' ? '💧' :
                   selectedSensorKey === 'turbidity' ? '🌊' :
                   selectedSensorKey === 'temperature' ? '🌡️' : '⚡'}
                </Text>
                <View>
                  <Text style={[styles.inspectorTitle, { color: theme.colors.textPrimary }]}>
                    {selectedSensorKey === 'pH' ? 'pH Potability Index' :
                     selectedSensorKey === 'tds' ? 'Total Dissolved Solids (TDS)' :
                     selectedSensorKey === 'turbidity' ? 'Water Turbidity & Clarity' :
                     selectedSensorKey === 'temperature' ? 'Thermal Sensor Reading' : 'Main Pipeline Flow Rate'}
                  </Text>
                  <Text style={[styles.inspectorSub, { color: theme.colors.textSecondary }]}>
                    Live Inspector · Stability Index 99.4% (Optimal)
                  </Text>
                </View>
              </View>
            </View>

            {/* Metrics Peak Hold Grid */}
            <View style={styles.peakHoldGrid}>
              <View style={[styles.peakChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={[styles.peakLabel, { color: theme.colors.textMuted }]}>Current Value</Text>
                <Text style={[styles.peakVal, { color: theme.colors.primary }]}>
                  {selectedSensorKey === 'pH' ? liveReading.pH :
                   selectedSensorKey === 'tds' ? `${liveReading.tds} ppm` :
                   selectedSensorKey === 'turbidity' ? `${liveReading.turbidity} NTU` :
                   selectedSensorKey === 'temperature' ? `${liveReading.temperature} °C` : `${liveReading.flowRate} L/m`}
                </Text>
              </View>

              <View style={[styles.peakChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={[styles.peakLabel, { color: theme.colors.textMuted }]}>Peak Min</Text>
                <Text style={[styles.peakVal, { color: '#22C55E' }]}>
                  {selectedSensorKey === 'pH' ? peakHold.current.pHMin :
                   selectedSensorKey === 'tds' ? peakHold.current.tdsMin : '0.2'}
                </Text>
              </View>

              <View style={[styles.peakChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={[styles.peakLabel, { color: theme.colors.textMuted }]}>Peak Max</Text>
                <Text style={[styles.peakVal, { color: '#EF4444' }]}>
                  {selectedSensorKey === 'pH' ? peakHold.current.pHMax :
                   selectedSensorKey === 'tds' ? peakHold.current.tdsMax : '4.8'}
                </Text>
              </View>
            </View>

            {/* Interactive Inspector Action Buttons */}
            <View style={styles.inspectorActions}>
              <TouchableOpacity
                style={[styles.inspectBtn, { backgroundColor: theme.colors.primary + '18', borderColor: theme.colors.primary + '40' }]}
                onPress={() => handleSimulateMetricSpike(selectedSensorKey)}
              >
                <Text style={[styles.inspectBtnText, { color: theme.colors.primary }]}>
                  ⚡ Simulate {selectedSensorKey.toUpperCase()} Spike
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.inspectBtn, { backgroundColor: '#8B5CF618', borderColor: '#8B5CF640' }]}
                onPress={() => handleAnnounceReading(
                  selectedSensorKey.toUpperCase(),
                  selectedSensorKey === 'pH' ? liveReading.pH :
                  selectedSensorKey === 'tds' ? liveReading.tds : liveReading.turbidity,
                  selectedSensorKey === 'pH' ? 'pH' : selectedSensorKey === 'tds' ? 'ppm' : 'NTU'
                )}
              >
                <Text style={[styles.inspectBtnText, { color: '#8B5CF6' }]}>
                  🔊 Announce Reading
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── LIVE WAVEFORMS SECTION WITH FILTER TABS ── */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Live Sensor Waveforms
            </Text>
            {/* Filter Pills */}
            <View style={styles.waveFilterRow}>
              {(['ALL', 'pH', 'tds', 'turbidity'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.waveFilterPill,
                    {
                      backgroundColor: waveFilter === f ? theme.colors.primary : theme.isDark ? '#1E293B' : '#F1F5F9',
                    },
                  ]}
                  onPress={() => setWaveFilter(f)}
                >
                  <Text style={[styles.waveFilterText, { color: waveFilter === f ? '#FFF' : theme.colors.textSecondary }]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {[
            { key: 'pH' as const,        label: 'pH Waveform',        color: '#0EA5E9', maxVal: 14 },
            { key: 'tds' as const,       label: 'TDS Waveform',       color: '#26A69A', maxVal: 300 },
            { key: 'turbidity' as const, label: 'Turbidity Waveform', color: '#8B5CF6', maxVal: 5 },
          ]
            .filter((w) => waveFilter === 'ALL' || waveFilter === w.key)
            .map(({ key, label, color, maxVal }) => (
              <View key={key} style={[styles.waveCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.waveHeader}>
                  <Text style={[styles.waveLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
                  <Text style={[styles.waveCurrent, { color }]}>
                    {waveBuffer.current[key].slice(-1)[0]?.toFixed(key === 'tds' ? 0 : 2)}
                  </Text>
                </View>
                <WaveBar
                  readings={waveBuffer.current[key]}
                  color={color}
                  height={44}
                  maxVal={maxVal}
                />
                <Text style={[styles.waveFooter, { color: theme.colors.textMuted }]}>
                  Rolling 12-reading buffer · {isPaused ? 'Paused' : 'Updating every 3s'}
                </Text>
              </View>
            ))}

          {/* Safe Range Reference */}
          <View style={[styles.rangeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.rangeTitle, { color: theme.colors.textPrimary }]}>Safe Threshold Reference</Text>
            {[
              { label: 'pH',          range: '6.8 – 7.6',   unit: 'pH',  color: '#0EA5E9' },
              { label: 'TDS',         range: '50 – 150',    unit: 'ppm', color: '#26A69A' },
              { label: 'Turbidity',   range: '0 – 1.0',     unit: 'NTU', color: '#8B5CF6' },
              { label: 'Temperature', range: '18 – 30',     unit: '°C',  color: '#F9A825' },
              { label: 'Flow',        range: '0 – 10',      unit: 'L/m', color: '#22C55E' },
            ].map(({ label, range, unit, color }) => (
              <View key={label} style={styles.rangeRow}>
                <Text style={[styles.rangeLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
                <View style={[styles.rangePill, { backgroundColor: color + '18', borderColor: color + '40' }]}>
                  <Text style={[styles.rangePillText, { color }]}>{range} {unit}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── HISTORICAL ANALYTICS TAB WITH INTERACTIVE BAR SELECTION ─────── */}
      {activeTab === 'history' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <View style={styles.periodRow}>
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodBtn,
                  {
                    backgroundColor: histPeriod === p ? theme.colors.primary : theme.isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: histPeriod === p ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setHistPeriod(p)}
              >
                <Text style={[styles.periodBtnText, { color: histPeriod === p ? '#FFF' : theme.colors.textSecondary }]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Interactive Inspection Card for Selected Bar */}
          {histData.length > 0 && selectedBarIdx !== null && histData[selectedBarIdx] && (
            <View style={[styles.selectedBarCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
              <Text style={[styles.selectedBarTitle, { color: theme.colors.textPrimary }]}>
                📅 Selected Period: {histData[selectedBarIdx].label}
              </Text>

              <View style={styles.selectedBarGrid}>
                <View style={[styles.barMetricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                  <Text style={styles.barMetricLabel}>pH</Text>
                  <Text style={[styles.barMetricVal, { color: '#0EA5E9' }]}>{histData[selectedBarIdx].pH}</Text>
                </View>
                <View style={[styles.barMetricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                  <Text style={styles.barMetricLabel}>TDS</Text>
                  <Text style={[styles.barMetricVal, { color: '#26A69A' }]}>{histData[selectedBarIdx].tds} ppm</Text>
                </View>
                <View style={[styles.barMetricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                  <Text style={styles.barMetricLabel}>Turbidity</Text>
                  <Text style={[styles.barMetricVal, { color: '#8B5CF6' }]}>{histData[selectedBarIdx].turbidity} NTU</Text>
                </View>
                <View style={[styles.barMetricChip, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC' }]}>
                  <Text style={styles.barMetricLabel}>Temp</Text>
                  <Text style={[styles.barMetricVal, { color: '#F9A825' }]}>{histData[selectedBarIdx].temp} °C</Text>
                </View>
              </View>
            </View>
          )}

          {/* Interactive Historical Charts */}
          {histData.length > 0 && (
            <>
              <HistoricalChart
                data={histData.map((d: any) => ({ label: d.label, value: d.pH }))}
                color="#0EA5E9" maxVal={8.5} unit="pH" title="pH Trend" icon="🧪"
                selectedBarIdx={selectedBarIdx} onSelectBar={(idx) => setSelectedBarIdx(idx)}
              />
              <HistoricalChart
                data={histData.map((d: any) => ({ label: d.label, value: d.tds }))}
                color="#26A69A" maxVal={200} unit="ppm" title="TDS Trend" icon="💧"
                selectedBarIdx={selectedBarIdx} onSelectBar={(idx) => setSelectedBarIdx(idx)}
              />
              <HistoricalChart
                data={histData.map((d: any) => ({ label: d.label, value: d.turbidity }))}
                color="#8B5CF6" maxVal={2} unit="NTU" title="Turbidity Trend" icon="🌊"
                selectedBarIdx={selectedBarIdx} onSelectBar={(idx) => setSelectedBarIdx(idx)}
              />
              <HistoricalChart
                data={histData.map((d: any) => ({ label: d.label, value: d.temp }))}
                color="#F9A825" maxVal={35} unit="°C" title="Temperature Trend" icon="🌡️"
                selectedBarIdx={selectedBarIdx} onSelectBar={(idx) => setSelectedBarIdx(idx)}
              />

              {/* Data Table */}
              <View style={[styles.tableCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.tableTitle, { color: theme.colors.textPrimary }]}>Raw Telemetry Log Table</Text>
                <View style={[styles.tableHeaderRow, { borderColor: theme.colors.border }]}>
                  {['Period', 'pH', 'TDS', 'Turb.', 'Temp.'].map((h) => (
                    <Text key={h} style={[styles.tableHeader, { color: theme.colors.textSecondary }]}>{h}</Text>
                  ))}
                </View>
                {histData.map((d: any, i: number) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.tableRow,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: selectedBarIdx === i ? theme.colors.primary + '18' : i % 2 === 0 ? 'transparent' : (theme.isDark ? '#0F172A30' : '#F8FAFC'),
                      },
                    ]}
                    onPress={() => setSelectedBarIdx(i)}
                  >
                    <Text style={[styles.tableCell, { color: theme.colors.textPrimary, fontWeight: '700' }]}>{d.label}</Text>
                    <Text style={[styles.tableCell, { color: '#0EA5E9' }]}>{d.pH}</Text>
                    <Text style={[styles.tableCell, { color: '#26A69A' }]}>{d.tds}</Text>
                    <Text style={[styles.tableCell, { color: '#8B5CF6' }]}>{d.turbidity}</Text>
                    <Text style={[styles.tableCell, { color: '#F9A825' }]}>{d.temp}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  streamControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  statusBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    color: '#FFF', fontSize: 11, fontWeight: '700',
  },
  pauseBtn: {
    paddingHorizontal: 12,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 10,
  },
  pauseBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  tapHintText: {
    fontSize: 10,
  },

  // Gauges
  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  gaugeCard: {
    width: '48.5%',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  gaugeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  warningPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  warningPillText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Flow card
  flowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  flowLeft: { flex: 1 },
  flowVal: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
    marginTop: 2,
  },
  flowBarCol: {
    alignItems: 'center',
    width: 32,
  },
  flowTrack: {
    width: 14,
    height: 70,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  flowFill: {
    width: '100%',
    borderRadius: 7,
  },
  flowBarLabel: {
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
  },

  // Interactive Inspector Card
  inspectorCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inspectorTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  inspectorSub: {
    fontSize: 10,
    marginTop: 1,
  },
  peakHoldGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  peakChip: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  peakLabel: {
    fontSize: 8,
    fontWeight: '700',
  },
  peakVal: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  inspectorActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  inspectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  inspectBtnText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // Waveforms
  waveFilterRow: {
    flexDirection: 'row',
    gap: 4,
  },
  waveFilterPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  waveFilterText: {
    fontSize: 9,
    fontWeight: '700',
  },
  waveCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  waveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  waveLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  waveCurrent: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
  },
  waveFooter: {
    fontSize: 9,
    marginTop: 3,
  },

  // Safe ranges
  rangeCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  rangeTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  rangeLabel: { fontSize: Typography.sizes.xs },
  rangePill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rangePillText: { fontSize: 10, fontWeight: '700' },

  // Historical
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    borderRadius: Spacing.borderRadius.sm,
    borderWidth: 1,
  },
  periodBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  selectedBarCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  selectedBarTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  selectedBarGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  barMetricChip: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  barMetricLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
  },
  barMetricVal: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  histCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  histHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  histTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    flex: 1,
  },
  unitPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unitPillText: { fontSize: 9, fontWeight: '700' },
  histStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xs,
  },
  histStat: { fontSize: 10 },

  // Data Table
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  tableTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 2,
  },
  tableHeader: {
    flex: 1,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
  },
});
