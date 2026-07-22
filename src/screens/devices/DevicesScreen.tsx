import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

import { Typography, Spacing } from '../../theme';

interface DevicesScreenProps {
  navigation: any;
}

export const DevicesScreen: React.FC<DevicesScreenProps> = ({ navigation }) => {
  const { theme } = useAppTheme();
  const [activeView, setActiveView] = useState<'grid' | 'diagram'>('grid');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Top Segment Control */}
      <View style={[styles.segmentBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
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
            🏡 House Pipeline Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Content */}
      <View style={{ flex: 1 }}>
        {activeView === 'grid' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Text style={{ fontSize: 40 }}>🔌</Text>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>Smart Devices Grid</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>Tap a device node for live diagnostics and control</Text>
          </View>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <Text style={{ fontSize: 40 }}>🏡</Text>
            <Text style={{ color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>House Pipeline Map</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>Visual layout of your home water pipeline</Text>
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
