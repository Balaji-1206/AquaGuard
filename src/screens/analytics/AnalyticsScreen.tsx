import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

import { Typography, Spacing } from '../../theme';

export const AnalyticsScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Segment Control */}
      <View style={[styles.segmentBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === 'live' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('live')}
        >
          <Text
            style={[
              styles.segmentText,
              { color: activeTab === 'live' ? '#FFF' : theme.colors.textSecondary },
            ]}
          >
            ⚡ Live Telemetry Gauges
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            activeTab === 'history' && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.segmentText,
              { color: activeTab === 'history' ? '#FFF' : theme.colors.textSecondary },
            ]}
          >
            📊 Historical Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'live' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Text style={{ fontSize: 40 }}>⚡</Text>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>Live Telemetry Gauges</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>Real-time sensor waveforms from your RO purifier</Text>
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Text style={{ fontSize: 40 }}>📊</Text>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>Historical Analytics</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>7-day trends and usage insights</Text>
          </View>
        )}
      </View>
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
});
