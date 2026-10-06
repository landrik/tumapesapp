import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';
import { ProfileHomeScreen } from '../screens/profile/ProfileHomeScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { AppearanceScreen } from '../screens/profile/AppearanceScreen';
import { NotificationPreferencesScreen } from '../screens/profile/NotificationPreferencesScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { KycStatusScreen } from '../screens/profile/KycStatusScreen';
import { KycSubmitScreen } from '../screens/profile/KycSubmitScreen';
import { LinkedDevicesScreen } from '../screens/profile/LinkedDevicesScreen';
import { HelpSupportScreen } from '../screens/profile/HelpSupportScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { LogoutConfirmScreen } from '../screens/profile/LogoutConfirmScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="KycStatus" component={KycStatusScreen} />
      <Stack.Screen name="KycSubmit" component={KycSubmitScreen} />
      <Stack.Screen name="LinkedDevices" component={LinkedDevicesScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen
        name="LogoutConfirm"
        component={LogoutConfirmScreen}
        options={{ presentation: 'transparentModal' }}
      />
    </Stack.Navigator>
  );
};
