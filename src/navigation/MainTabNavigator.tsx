import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppTheme } from '../context/ThemeContext';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { AIInsightsScreen } from '../screens/ai/AIInsightsScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { DevicesScreen } from '../screens/devices/DevicesScreen';
import { NodeDetailScreen } from '../screens/nodes/NodeDetailScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import {
  SvgWaterDropIcon,
  SvgWaterValveIcon,
  SvgWaterWaveAnalyticsIcon,
  SvgWaterUserShieldIcon,
} from '../components/common/SvgIcons';
import { Typography, Spacing } from '../theme';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const DevicesStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="DashboardHome" component={DashboardScreen} />
    <HomeStack.Screen name="AIInsights" component={AIInsightsScreen} />
    <HomeStack.Screen name="AlertsTimeline" component={AlertsScreen} />
  </HomeStack.Navigator>
);

const DevicesStackNavigator = () => (
  <DevicesStack.Navigator screenOptions={{ headerShown: false }}>
    <DevicesStack.Screen name="DevicesMain" component={DevicesScreen} />
    <DevicesStack.Screen name="NodeDetail" component={NodeDetailScreen} />
  </DevicesStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="SettingsMain" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

export const MainTabNavigator: React.FC = () => {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.floatingTabBar,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.isDark ? '#3A506B' : '#BAE6FD',
            shadowColor: theme.isDark ? '#000000' : '#0284C7',
          },
        ],
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: Typography.weights.bold,
          marginTop: -2,
        },
        tabBarIcon: ({ focused }) => {
          const iconColor = focused ? theme.colors.primary : theme.colors.textMuted;

          let renderIcon = <SvgWaterDropIcon color={iconColor} size={22} focused={focused} />;

          if (route.name === 'HomeTab') {
            renderIcon = <SvgWaterDropIcon color={iconColor} size={22} focused={focused} />;
          } else if (route.name === 'DevicesTab') {
            renderIcon = <SvgWaterValveIcon color={iconColor} size={22} focused={focused} />;
          } else if (route.name === 'AnalyticsTab') {
            renderIcon = <SvgWaterWaveAnalyticsIcon color={iconColor} size={22} focused={focused} />;
          } else if (route.name === 'ProfileTab') {
            renderIcon = <SvgWaterUserShieldIcon color={iconColor} size={22} focused={focused} />;
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused && { backgroundColor: `${theme.colors.primary}18` },
              ]}
            >
              {renderIcon}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Hydro' }}
      />
      <Tab.Screen
        name="DevicesTab"
        component={DevicesStackNavigator}
        options={{ tabBarLabel: 'Devices' }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Telemetry' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  floatingTabBar: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    height: 66,
    borderRadius: Spacing.borderRadius.xl,
    borderWidth: 1,
    paddingBottom: 8,
    paddingTop: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
