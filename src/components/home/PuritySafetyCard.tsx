import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { FlowGradient } from '../common/FlowGradient';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';
import { WaterQualityStatus } from '../../types';

interface PuritySafetyCardProps {
  status: WaterQualityStatus;
  purityScore: number;
  reasoning: string;
}

export const PuritySafetyCard: React.FC<PuritySafetyCardProps> = ({
  status,
  purityScore = 99,
}) => {
  const { theme } = useAppTheme();

  // Shield breathing pulse
  const shieldScale = useRef(new Animated.Value(1)).current;
  // Moving highlight streak
  const streakX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Breathing shield scale
    const scaleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(shieldScale, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(shieldScale, { toValue: 1.0, duration: 1800, useNativeDriver: true }),
      ])
    );
    // Caustic highlight streak — slow pass every 5s
    const streakAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(streakX, { toValue: 420, duration: 3200, useNativeDriver: true }),
        Animated.timing(streakX, { toValue: -120, duration: 0, useNativeDriver: true }),
        Animated.delay(1800),
      ])
    );

    scaleAnim.start();
    streakAnim.start();
    return () => { scaleAnim.stop(); streakAnim.stop(); };
  }, [shieldScale, streakX]);

  return (
    <View style={[styles.heroCard, { backgroundColor: theme.isDark ? '#1C2541' : '#0284C7' }]}>
      {/* Multi-layer caustic flow gradients */}
      <FlowGradient phase={0} speed={5000} opacity={0.12} dark height={160} />
      <FlowGradient phase={0.5} speed={7500} opacity={0.08} dark height={160} />

      {/* Moving highlight streak */}
      <Animated.View
        style={[styles.highlightStreak, { transform: [{ translateX: streakX }] }]}
        pointerEvents="none"
      />

      {/* Radial glow behind shield */}
      <View style={styles.shieldGlow} pointerEvents="none">
        <Svg width={120} height={120}>
          <Defs>
            <RadialGradient id="radGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Path d="M0 0 H120 V120 H0 Z" fill="url(#radGlow)" />
        </Svg>
      </View>

      {/* Top Row */}
      <View style={styles.topBannerRow}>
        <View style={styles.badgePill}>
          <View style={styles.liveDot} />
          <Text style={styles.badgePillText}>HYDRO PURIFIER LIVE</Text>
        </View>
        <Text style={styles.locationPill}>📍 Villa 42, Palm Meadows</Text>
      </View>

      {/* Main Score Row */}
      <View style={styles.mainScoreRow}>
        <View style={styles.scoreTextWrapper}>
          <Text style={styles.heroStatusText}>SAFE TO DRINK</Text>
          <Text style={styles.heroSubText}>
            TDS: 85 ppm • Turbidity: 0.2 NTU (Crystal Clear)
          </Text>
        </View>

        {/* Breathing Shield Badge */}
        <Animated.View style={[styles.shieldRing, { transform: [{ scale: shieldScale }] }]}>
          <Text style={{ fontSize: 28 }}>🛡️</Text>
          <Text style={styles.shieldScoreText}>{purityScore}%</Text>
        </Animated.View>
      </View>

      {/* Safety Chips */}
      <View style={styles.chipsRow}>
        {['🥛 Drinking: Safe', '🍲 Cooking: Safe', '👶 Formula: Safe'].map((c) => (
          <View key={c} style={styles.chip}>
            <Text style={styles.chipText}>{c}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: Spacing.borderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  highlightStreak: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    left: 0,
  },
  shieldGlow: {
    position: 'absolute',
    right: Spacing.lg,
    top: 40,
    width: 120,
    height: 120,
  },
  topBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Spacing.borderRadius.round,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  badgePillText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  locationPill: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: Typography.weights.medium,
  },
  mainScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  scoreTextWrapper: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  heroStatusText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroSubText: {
    fontSize: Typography.sizes.xs,
    color: '#E0F2FE',
    marginTop: 2,
    lineHeight: Typography.lineHeights.xs,
  },
  shieldRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 2,
    borderColor: '#7DD3FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldScoreText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    marginTop: -4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Spacing.borderRadius.round,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
