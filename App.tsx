import React, { useState } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { WaterDataProvider } from './src/context/WaterDataContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { VoiceAlertProvider } from './src/context/VoiceAlertContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WaterBackground } from './src/components/common/WaterBackground';

type ViewMode = 'mobile' | 'web';

const MainAppWrapper = () => {
  const { isDark, theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>('mobile');

  // If running on Web with desktop resolution (> 500px), allow toggling between Mobile device frame and Web desktop view
  const isWebDesktop = Platform.OS === 'web' && width > 500;

  if (isWebDesktop) {
    const isMobileMode = viewMode === 'mobile';

    return (
      <View style={[styles.webOuterContainer, { backgroundColor: isDark ? '#060A12' : '#D0E3F0' }]}>
        {/* Top Control Bar with Toggle Button */}
        <View
          style={[
            styles.topControlBar,
            {
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.brandBadgeContainer}>
            <Text style={{ fontSize: 18 }}>💧</Text>
            <Text style={[styles.brandBadgeTitle, { color: theme.colors.primary }]}>AquaGuard</Text>
            <View
              style={[
                styles.modeIndicatorBadge,
                {
                  backgroundColor: isMobileMode ? '#0284C720' : '#10B98120',
                  borderColor: isMobileMode ? '#0284C7' : '#10B981',
                },
              ]}
            >
              <Text
                style={[
                  styles.modeIndicatorText,
                  { color: isMobileMode ? '#0284C7' : '#10B981' },
                ]}
              >
                {isMobileMode ? 'MOBILE PREVIEW' : 'WEB DESKTOP'}
              </Text>
            </View>
          </View>

          {/* Toggle Button Segmented Control */}
          <View style={[styles.toggleSegmentContainer, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.toggleSegmentBtn,
                isMobileMode && [styles.activeSegmentBtn, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setViewMode('mobile')}
            >
              <Text
                style={[
                  styles.toggleSegmentText,
                  { color: isMobileMode ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                📱 Mobile View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.toggleSegmentBtn,
                !isMobileMode && [styles.activeSegmentBtn, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => setViewMode('web')}
            >
              <Text
                style={[
                  styles.toggleSegmentText,
                  { color: !isMobileMode ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
                ]}
              >
                💻 Web View
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Viewport Stage */}
        <View style={styles.webContentStage}>
          {isMobileMode ? (
            <View
              style={[
                styles.mobileDeviceFrame,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: isDark ? '#3A506B' : '#CBD5E1',
                },
              ]}
            >
              {/* Top Speaker Notch Simulation */}
              <View style={[styles.notchBar, { backgroundColor: isDark ? '#3A506B' : '#CBD5E1' }]} />

              <SafeAreaProvider>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <WaterBackground>
                  <AppNavigator />
                </WaterBackground>
              </SafeAreaProvider>
            </View>
          ) : (
            <View style={[styles.webDesktopFrame, { backgroundColor: theme.colors.background }]}>
              <SafeAreaProvider>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <WaterBackground>
                  <AppNavigator />
                </WaterBackground>
              </SafeAreaProvider>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Native Mobile or Small Screen Viewport
  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <WaterBackground>
        <AppNavigator />
      </WaterBackground>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WaterDataProvider>
          <NotificationProvider>
            {/* VoiceAlertProvider wraps inside NotificationProvider so it can
                register the voice callback after both contexts are initialized */}
            <VoiceAlertProvider>
              <MainAppWrapper />
            </VoiceAlertProvider>
          </NotificationProvider>
        </WaterDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
  },
  topControlBar: {
    width: '100%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  brandBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  modeIndicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 10,
  },
  modeIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleSegmentContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 20,
  },
  toggleSegmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegmentBtn: {
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleSegmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  webContentStage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  mobileDeviceFrame: {
    width: 440,
    height: '96%',
    maxHeight: 900,
    borderRadius: 44,
    borderWidth: 8,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  webDesktopFrame: {
    width: '100%',
    maxWidth: 1200,
    height: '98%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  notchBar: {
    width: 120,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
    zIndex: 9999,
  },
});

