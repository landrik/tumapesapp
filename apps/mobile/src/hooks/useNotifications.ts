import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppSelector } from '../store/hooks';
import {
  registerForPushNotifications,
  parseNotificationData,
} from '../utils/notifications';
import { savePushToken } from '../api/users';
import { navigateToTransfer } from '../navigation/navigationRef';

/**
 * Registers for push notifications once the user is authenticated, saves
 * the token to the backend, and routes notification taps to the relevant
 * screen (currently: transfer updates -> TransactionDetail).
 */
export const useNotifications = (): void => {
  const token = useAppSelector(state => state.auth.token);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    (async () => {
      const pushToken = await registerForPushNotifications();
      if (pushToken && isMounted) {
        try {
          await savePushToken(pushToken);
        } catch {
          // Non-fatal: push notifications simply won't be delivered.
        }
      }
    })();

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = parseNotificationData(response);
      if (data.transferId) {
        navigateToTransfer(data.transferId);
      }
    });

    return () => {
      isMounted = false;
      responseListener.current?.remove();
    };
  }, [token]);
};
