import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityStackParamList } from '../types/navigation';
import { TransactionListScreen } from '../screens/activity/TransactionListScreen';
import { TransactionDetailScreen } from '../screens/activity/TransactionDetailScreen';
import { TransactionReceiptScreen } from '../screens/activity/TransactionReceiptScreen';

const Stack = createNativeStackNavigator<ActivityStackParamList>();

export const ActivityNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransactionList" component={TransactionListScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="TransactionReceipt" component={TransactionReceiptScreen} />
    </Stack.Navigator>
  );
};
