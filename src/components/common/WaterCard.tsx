/**
 * WaterCard.tsx
 * Premium glassmorphic card with per-card independent FlowGradient
 * and gentle floating rise animation.
 * Uses React Native's built-in Animated API — Web + Mobile compatible.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Animated } from 'react-native';
import { FlowGradient } from './FlowGradient';
import { useAppTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

interface WaterCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  phase?: number;
  flowSpeed?: number;
  flowOpacity?: number;
  float?: boolean;
}

export const WaterCard: React.FC<WaterCardProps> = ({
  children,
  style,
  phase = 0,
  flowSpeed = 5500,
  flowOpacity = 0.055,
  float = true,
}) => {
  const { theme } = useAppTheme();
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!float) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -2.5,
          duration: 3000 + phase * 800,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 3000 + phase * 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatY, float, phase]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: theme.isDark
            ? 'rgba(28, 37, 65, 0.85)'
            : 'rgba(255, 255, 255, 0.87)',
          borderColor: theme.isDark ? '#3A506B' : '#BAE6FD',
          shadowColor: theme.isDark ? '#000' : '#0284C7',
          transform: [{ translateY: floatY }],
        },
        style,
      ]}
    >
      {/* Per-card FlowGradient wave layer */}
      <FlowGradient
        phase={phase}
        speed={flowSpeed}
        opacity={flowOpacity}
        dark={theme.isDark}
        height={80}
      />

      {/* Foreground card content */}
      <View style={styles.content}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  content: {
    padding: Spacing.md,
  },
});
