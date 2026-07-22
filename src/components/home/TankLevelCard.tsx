import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';

import { Badge } from '../common/Badge';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography, Spacing } from '../../theme';
import { TankLevelInfo } from '../../types';

interface TankLevelCardProps {
  tankInfo: TankLevelInfo;
}

export const TankLevelCard: React.FC<TankLevelCardProps> = ({ tankInfo }) => {
  const { theme } = useAppTheme();
  const [valveState, setValveState] = useState<'OPEN' | 'CLOSED'>('OPEN');

  const fillAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: tankInfo.currentLevelPercent,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [fillAnim, tankInfo.currentLevelPercent]);

  const toggleValve = () => {
    const nextState = valveState === 'OPEN' ? 'CLOSED' : 'OPEN';
    setValveState(nextState);
    Alert.alert(
      'Smart Hydro Valve Toggled',
      `Main Water Inlet Valve is now ${nextState === 'OPEN' ? 'OPEN (Normal Hydro Flow)' : 'CLOSED (Shutoff Active)'}.`
    );
  };

  const fillHeightInterpolation = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.card, {backgroundColor: theme.colors.card, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border}]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            Roof Tank & Hydro Shutoff Valve
          </Text>
          <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>
            Capacity: {tankInfo.tankCapacityLiters} Liters
          </Text>
        </View>
        <Badge label={`PUMP: ${tankInfo.pumpState}`} color="#0EA5E9" size="sm" />
      </View>

      <View style={styles.meterContainer}>
        {/* Animated Water Tank Graphic */}
        <View style={[styles.tankGraphic, { borderColor: theme.isDark ? '#38BDF8' : '#0284C7' }]}>
          <Animated.View style={[styles.waterFill, { height: fillHeightInterpolation }]} />
          <Text style={styles.tankText}>{tankInfo.currentLevelPercent}%</Text>
        </View>

        <View style={styles.tankDetails}>
          <Text style={[styles.volumeText, { color: theme.colors.textPrimary }]}>
            {tankInfo.currentLiters} L / {tankInfo.tankCapacityLiters} L
          </Text>
          <Text style={[styles.statusSub, { color: theme.colors.textSecondary }]}>
            {tankInfo.estimatedFullTime}
          </Text>

          {/* Smart Valve Remote Trigger Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.valveBtn,
              { backgroundColor: valveState === 'OPEN' ? '#10B98118' : '#EF444418' },
            ]}
            onPress={toggleValve}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>
              {valveState === 'OPEN' ? '🚰' : '🚫'}
            </Text>
            <Text
              style={[
                styles.valveBtnText,
                { color: valveState === 'OPEN' ? '#10B981' : '#EF4444' },
              ]}
            >
              Main Hydro Valve: {valveState === 'OPEN' ? 'OPEN (Normal Flow)' : 'CLOSED (Shutoff)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sub: {
    fontSize: Typography.sizes.xs,
  },
  meterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tankGraphic: {
    width: 64,
    height: 94,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 2.5,
    backgroundColor: '#0EA5E915',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginRight: Spacing.md,
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0EA5E960',
  },
  tankText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.heavy,
    color: '#0284C7',
    zIndex: 2,
  },
  tankDetails: {
    flex: 1,
  },
  volumeText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  statusSub: {
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.sm,
  },
  valveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: Spacing.borderRadius.md,
  },
  valveBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});

