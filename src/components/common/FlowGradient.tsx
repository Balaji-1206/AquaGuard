/**
 * FlowGradient.tsx
 * Slow horizontally-flowing translucent water caustic layer.
 * Uses React Native's built-in Animated API (Web + Mobile compatible).
 * Opacity: 4%–12% — barely perceptible, premium feel.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface FlowGradientProps {
  phase?: number;
  speed?: number;
  opacity?: number;
  height?: number;
  dark?: boolean;
}

// Build SVG wave path
const wPath = (amp: number, freq: number, w: number, h: number): string => {
  const seg = w / freq;
  let d = `M 0 ${h / 2}`;
  for (let i = 0; i <= freq; i++) {
    const x1 = i * seg - seg * 0.5;
    const y1 = i % 2 === 0 ? h / 2 - amp : h / 2 + amp;
    const x2 = i * seg;
    d += ` Q ${x1} ${y1} ${x2} ${h / 2}`;
  }
  d += ` L ${w} ${h} L 0 ${h} Z`;
  return d;
};

export const FlowGradient: React.FC<FlowGradientProps> = ({
  phase = 0,
  speed = 5500,
  opacity = 0.06,
  height = 120,
  dark = false,
}) => {
  const translateX = useRef(new Animated.Value(-(phase * 400))).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 400,
        duration: speed,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [translateX, speed]);

  const waveColor1 = dark ? '#38BDF8' : '#0EA5E9';
  const waveColor2 = dark ? '#7DD3FC' : '#38BDF8';

  return (
    <View
      style={[styles.container, { height, opacity }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.waveLayer,
          { transform: [{ translateX }] },
        ]}
      >
        <Svg width={800} height={height}>
          <Defs>
            <LinearGradient id={`wg1_${phase}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={waveColor1} stopOpacity="0.5" />
              <Stop offset="0.5" stopColor={waveColor2} stopOpacity="0.9" />
              <Stop offset="1" stopColor={waveColor1} stopOpacity="0.5" />
            </LinearGradient>
          </Defs>
          <Path d={wPath(14, 6, 800, height)} fill={`url(#wg1_${phase})`} />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  waveLayer: {
    position: 'absolute',
    left: -400,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
