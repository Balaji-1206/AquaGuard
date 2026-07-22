/**
 * WaterBackground.tsx
 * Full-page ambient caustic water light rays.
 * Opacity: 3%–4%. Barely visible, purely ambient.
 * Uses React Native's built-in Animated API — Web + Mobile compatible.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useAppTheme } from '../../context/ThemeContext';

const wavePath = (amp: number, period: number, w: number, h: number): string => {
  const seg = w / period;
  let d = `M -${w} ${h / 2 + amp}`;
  for (let i = 0; i <= period * 2; i++) {
    const x = -w + i * seg;
    const y = h / 2 + (i % 2 === 0 ? amp : -amp);
    d += ` Q ${x - seg / 2} ${y} ${x} ${h / 2}`;
  }
  d += ` L ${w} ${h} L -${w} ${h} Z`;
  return d;
};

export const WaterBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useAppTheme();

  const layer1 = useRef(new Animated.Value(0)).current;
  const layer2 = useRef(new Animated.Value(-60)).current;
  const layer3 = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    const a1 = Animated.loop(
      Animated.timing(layer1, { toValue: 400, duration: 9000, useNativeDriver: true })
    );
    const a2 = Animated.loop(
      Animated.timing(layer2, { toValue: 400, duration: 12000, useNativeDriver: true })
    );
    const a3 = Animated.loop(
      Animated.timing(layer3, { toValue: 400, duration: 7000, useNativeDriver: true })
    );
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, [layer1, layer2, layer3]);

  const wColor = theme.isDark ? '#38BDF8' : '#0284C7';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Ambient caustic background layers */}
      <View style={styles.bgLayer} pointerEvents="none">
        <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: layer1 }] }]}>
          <Svg width="200%" height="100%">
            <Defs>
              <LinearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={wColor} stopOpacity="0" />
                <Stop offset="0.5" stopColor={wColor} stopOpacity="0.04" />
                <Stop offset="1" stopColor={wColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d={wavePath(30, 4, 800, 900)} fill="url(#bg1)" />
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: layer2 }] }]}>
          <Svg width="200%" height="100%">
            <Defs>
              <LinearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={wColor} stopOpacity="0" />
                <Stop offset="0.5" stopColor={wColor} stopOpacity="0.03" />
                <Stop offset="1" stopColor={wColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d={wavePath(20, 6, 800, 900)} fill="url(#bg2)" />
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFillObject, { transform: [{ translateX: layer3 }] }]}>
          <Svg width="200%" height="100%">
            <Defs>
              <LinearGradient id="bg3" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={wColor} stopOpacity="0" />
                <Stop offset="0.5" stopColor={wColor} stopOpacity="0.025" />
                <Stop offset="1" stopColor={wColor} stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path d={wavePath(40, 3, 800, 900)} fill="url(#bg3)" />
          </Svg>
        </Animated.View>
      </View>

      {/* Main app content */}
      <View style={styles.foreground}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  foreground: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});
