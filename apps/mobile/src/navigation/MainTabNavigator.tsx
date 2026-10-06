import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types/navigation';
import { colors } from '../constants/colors';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SendMoneyNavigator } from './SendMoneyNavigator';
import { ActivityNavigator } from './ActivityNavigator';
import { RecipientsNavigator } from './RecipientsNavigator';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Send: 'paper-plane-outline',
  Activity: 'list-outline',
  Recipients: 'people-outline',
  Profile: 'person-outline',
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof MainTabParamList]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Send" component={SendMoneyNavigator} />
      <Tab.Screen name="Activity" component={ActivityNavigator} />
      <Tab.Screen name="Recipients" component={RecipientsNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};
