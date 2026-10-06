import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecipientsStackParamList } from '../types/navigation';
import { RecipientListScreen } from '../screens/recipients/RecipientListScreen';
import { RecipientDetailScreen } from '../screens/recipients/RecipientDetailScreen';
import { EditRecipientScreen } from '../screens/recipients/EditRecipientScreen';

const Stack = createNativeStackNavigator<RecipientsStackParamList>();

export const RecipientsNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipientList" component={RecipientListScreen} />
      <Stack.Screen name="RecipientDetail" component={RecipientDetailScreen} />
      <Stack.Screen name="EditRecipient" component={EditRecipientScreen} />
    </Stack.Navigator>
  );
};
