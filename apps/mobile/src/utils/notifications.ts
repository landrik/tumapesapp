import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationChannel = 'transfers' | 'security' | 'promotions';

export const setupAndroidChannels = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('transfers', {
    name: 'Transfer updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });

  await Notifications.setNotificationChannelAsync('security', {
    name: 'Security alerts',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });

  await Notifications.setNotificationChannelAsync('promotions', {
    name: 'Promotions',
    importance: Notifications.AndroidImportance.LOW,
  });
};

/**
 * Requests notification permissions and returns an Expo push token, or
 * null if the device isn't physical, permissions were denied, no EAS
 * project is linked yet, or nothing is available (e.g. running in a
 * simulator without push capability).
 *
 * getExpoPushTokenAsync() requires a `projectId` since it can no longer be
 * reliably inferred from the app config alone (particularly in Expo Go).
 * That id only exists once this project has been linked with `eas init`,
 * which writes it to app.json under expo.extra.eas.projectId. Until that's
 * done, this fails soft — push tokens just won't be available, rather than
 * crashing the app.
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  await setupAndroidChannels();

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn(
      'Push notifications skipped: no EAS projectId is linked. Run `eas init` to link this ' +
        'project, then rebuild — see app.json expo.extra.eas.projectId.'
    );
    return null;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenResponse.data;
  } catch (err) {
    console.warn('Push notifications skipped: could not get a push token.', err);
    return null;
  }
};

export interface DeepLinkNotificationData {
  screen?: string;
  transferId?: string;
  recipientId?: string;
}

export const parseNotificationData = (
  response: Notifications.NotificationResponse
): DeepLinkNotificationData => {
  return (response.notification.request.content.data || {}) as DeepLinkNotificationData;
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  channel: NotificationChannel = 'transfers',
  secondsFromNow = 0
): Promise<string> => {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: {} },
    trigger:
      secondsFromNow > 0
        ? { seconds: secondsFromNow, channelId: channel, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL }
        : null,
  });
};
