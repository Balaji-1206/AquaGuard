/**
 * Contamination Source Topology Map
 * ====================================
 * Novelty 3 UI: SVG diagram of the household water supply graph.
 * Contaminated pipe segments are highlighted in red/orange.
 * Uses react-native-svg (already in package.json).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, {
  Circle, Rect, Line, Text as SvgText, Defs, LinearGradient as SvgGradient,
  Stop, G, Path,
} from 'react-native-svg';
import { ContaminationSourceEvent, HomeZoneType } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';

interface ContaminationMapProps {
  event: ContaminationSourceEvent;
  onDismiss?: () => void;
}

// ─── Node positions in the 300×200 SVG viewport ──────────────────────────────
const NODES: Record<string, { x: number; y: number; label: string; emoji: string; zone: HomeZoneType }> = {
  municipal:  { x: 150, y: 20,  label: 'Municipal',   emoji: '🏛️', zone: 'Underground Sump' },
  sump:       { x: 150, y: 80,  label: 'Sump Pump',   emoji: '⚙️', zone: 'Underground Sump' },
  tank:       { x: 150, y: 148, label: 'Roof Tank',   emoji: '🏠', zone: 'Overhead Roof Tank' },
  ro:         { x: 72,  y: 200, label: 'Kitchen RO',  emoji: '💧', zone: 'Kitchen RO Purifier' },
  bathroom:   { x: 228, y: 200, label: 'Bathroom',    emoji: '🚿', zone: 'Bathroom Supply' },
};

// Pipe edges
const EDGES: Array<{ from: string; to: string }> = [
  { from: 'municipal', to: 'sump' },
  { from: 'sump',      to: 'tank' },
  { from: 'tank',      to: 'ro' },
  { from: 'tank',      to: 'bathroom' },
];

function isZoneAffected(zone: HomeZoneType, event: ContaminationSourceEvent): boolean {
  return event.sourceZone === zone || event.affectedZones.includes(zone);
}

function getNodeZone(nodeKey: string): HomeZoneType | null {
  if (nodeKey === 'sump' || nodeKey === 'municipal') return 'Underground Sump';
  if (nodeKey === 'tank')     return 'Overhead Roof Tank';
  if (nodeKey === 'ro')       return 'Kitchen RO Purifier';
  if (nodeKey === 'bathroom') return 'Bathroom Supply';
  return null;
}

function isEdgeContaminated(from: string, to: string, event: ContaminationSourceEvent): boolean {
  const fromZone = getNodeZone(from);
  const toZone   = getNodeZone(to);
  if (!fromZone || !toZone) return false;
  return isZoneAffected(fromZone, event) || isZoneAffected(toZone, event);
}

export const ContaminationMap: React.FC<ContaminationMapProps> = ({ event, onDismiss }) => {
  const { theme } = useAppTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide-in animation
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim,   { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Pulse the source node
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sourceNodeColor = '#EF4444';  // red
  const affectedColor   = '#F97316';  // orange
  const safeColor       = theme.isDark ? '#22D3EE' : '#0EA5E9'; // teal/blue
  const edgeSafe        = theme.isDark ? '#334155' : '#CBD5E1';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: '#EF444430',
          opacity: opacityAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.mapEmoji}>📍</Text>
          <View>
            <Text style={[styles.mapTitle, { color: theme.colors.textPrimary }]}>
              Contamination Source Identified
            </Text>
            <Text style={[styles.mapSub, { color: theme.colors.textSecondary }]}>
              {event.sourceZone} · Confidence {event.confidence}%
            </Text>
          </View>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confidence bar */}
      <View style={[styles.confBar, { backgroundColor: theme.isDark ? '#1E293B' : '#F1F5F9' }]}>
        <View style={[styles.confFill, { width: `${event.confidence}%`, backgroundColor: event.confidence > 80 ? '#EF4444' : '#F97316' }]} />
      </View>
      <Text style={[styles.confLabel, { color: theme.colors.textSecondary }]}>
        {event.confidence}% confidence — based on {event.evidenceRules.length} correlated sensor rules
      </Text>

      {/* SVG Topology Map */}
      <View style={styles.svgWrapper}>
        <Svg width="100%" height={250} viewBox="0 0 300 240">
          <Defs>
            <SvgGradient id="sourceGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#EF4444" />
              <Stop offset="100%" stopColor="#DC2626" />
            </SvgGradient>
          </Defs>

          {/* Edges (pipes) */}
          {EDGES.map(({ from, to }) => {
            const fn = NODES[from];
            const tn = NODES[to];
            const contaminated = isEdgeContaminated(from, to, event);
            return (
              <G key={`${from}-${to}`}>
                <Line
                  x1={fn.x} y1={fn.y}
                  x2={tn.x} y2={tn.y}
                  stroke={contaminated ? '#EF4444' : edgeSafe}
                  strokeWidth={contaminated ? 4 : 2}
                  strokeDasharray={contaminated ? '6,3' : undefined}
                  strokeOpacity={contaminated ? 0.85 : 0.6}
                />
                {/* Flow direction arrow */}
                <Circle
                  cx={(fn.x + tn.x) / 2}
                  cy={(fn.y + tn.y) / 2}
                  r={4}
                  fill={contaminated ? '#EF4444' : edgeSafe}
                  opacity={0.7}
                />
              </G>
            );
          })}

          {/* Nodes */}
          {Object.entries(NODES).map(([key, node]) => {
            const zone = getNodeZone(key);
            const isSource   = zone === event.sourceZone;
            const isAffected = zone && event.affectedZones.includes(zone as HomeZoneType);
            const nodeColor  = isSource ? sourceNodeColor : isAffected ? affectedColor : safeColor;
            const r          = isSource ? 22 : 18;

            return (
              <G key={key}>
                {/* Outer glow for source */}
                {isSource && (
                  <Circle cx={node.x} cy={node.y} r={30} fill="#EF444420" stroke="#EF444440" strokeWidth={1} />
                )}
                <Circle
                  cx={node.x} cy={node.y} r={r}
                  fill={isSource ? 'url(#sourceGrad)' : nodeColor + '25'}
                  stroke={nodeColor}
                  strokeWidth={isSource ? 2.5 : 1.5}
                />
                <SvgText
                  x={node.x} y={node.y + 5}
                  fontSize={isSource ? 14 : 12}
                  textAnchor="middle"
                >
                  {node.emoji}
                </SvgText>
                <SvgText
                  x={node.x} y={node.y + r + 10}
                  fontSize={9}
                  fill={theme.colors.textSecondary}
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {node.label}
                </SvgText>
                {isSource && (
                  <SvgText x={node.x} y={node.y + r + 20} fontSize={8} fill="#EF4444" textAnchor="middle" fontWeight="bold">
                    ⚠ SOURCE
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Source Zone</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Affected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: safeColor }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Clean</Text>
        </View>
      </View>

      {/* Evidence Rules */}
      {event.evidenceRules.length > 0 && (
        <View style={[styles.evidenceBox, { backgroundColor: theme.isDark ? '#0F172A' : '#FEF2F2', borderColor: '#EF444420' }]}>
          <Text style={[styles.evidenceTitle, { color: '#EF4444' }]}>Correlation Evidence</Text>
          {event.evidenceRules.map((rule, i) => (
            <Text key={i} style={[styles.evidenceItem, { color: theme.colors.textSecondary }]}>
              · {rule.rule} ({rule.metric}: {rule.observedValue})
            </Text>
          ))}
        </View>
      )}

      {/* Recommended Action */}
      <View style={[styles.actionBox, { backgroundColor: theme.isDark ? '#1E293B' : '#F0FDF4', borderColor: '#22C55E30' }]}>
        <Text style={styles.actionEmoji}>💡</Text>
        <Text style={[styles.actionText, { color: theme.colors.textPrimary }]}>
          {event.recommendedAction}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  mapTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  mapSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 1,
  },
  dismissBtn: {
    padding: 4,
    marginLeft: Spacing.sm,
  },
  confBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confFill: {
    height: '100%',
    borderRadius: 3,
  },
  confLabel: {
    fontSize: 10,
    marginBottom: Spacing.sm,
  },
  svgWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
  },
  evidenceBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  evidenceTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  evidenceItem: {
    fontSize: 10,
    lineHeight: 16,
  },
  actionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  actionEmoji: {
    fontSize: 14,
  },
  actionText: {
    fontSize: Typography.sizes.xs,
    flex: 1,
    lineHeight: 18,
  },
});
