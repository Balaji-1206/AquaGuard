import { Alert } from 'react-native';
import { HomeAlert } from '../types';

export const NotificationService = {
  triggerCriticalAlertNotification(alertData: HomeAlert) {
    Alert.alert(
      `🚨 HOME WATER ALERT - ${alertData.title}`,
      `Device: ${alertData.deviceName}\nZone: ${alertData.zone}\nMessage: ${alertData.message}`,
      [
        { text: 'Acknowledge', style: 'cancel' },
        { text: 'View Home Alerts', onPress: () => {} },
      ]
    );
  },

  triggerNodeOfflineNotification(deviceName: string, zone: string) {
    Alert.alert(
      `⚡ DEVICE OFFLINE WARNING`,
      `Smart Device '${deviceName}' in ${zone} lost Wi-Fi connection.`,
      [{ text: 'Dismiss' }]
    );
  },

  triggerLowBatteryNotification(deviceName: string, batteryPercent: number) {
    Alert.alert(
      `🔋 LOW BATTERY WARNING`,
      `Device '${deviceName}' battery is down to ${batteryPercent}%.`,
      [{ text: 'OK' }]
    );
  },
};
