import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { WaterDataProvider } from './src/context/WaterDataContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { WaterBackground } from './src/components/common/WaterBackground';

const MainAppWrapper = () => {
  const { isDark, theme } = useAppTheme();
  const { width } = useWindowDimensions();

  // If running on Web with desktop resolution (> 500px), wrap in a sleek smartphone frame
  const isWebDesktop = Platform.OS === 'web' && width > 500;

  if (isWebDesktop) {
    return (
      <View style={[styles.webOuterContainer, { backgroundColor: isDark ? '#060A12' : '#D0E3F0' }]}>
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
      </View>
    );
  }

  // Native Mobile or Mobile Browser Viewport
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
            <MainAppWrapper />
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
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  mobileDeviceFrame: {
    width: 440,
    height: '94%',
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
