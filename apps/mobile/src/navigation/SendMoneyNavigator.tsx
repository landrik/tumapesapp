import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../types/navigation';
import { SendHomeScreen } from '../screens/send/SendHomeScreen';
import { SelectRecipientScreen } from '../screens/send/SelectRecipientScreen';
import { AddRecipientScreen } from '../screens/send/AddRecipientScreen';
import { EnterAmountScreen } from '../screens/send/EnterAmountScreen';
import { DeliveryMethodScreen } from '../screens/send/DeliveryMethodScreen';
import { ReviewTransferScreen } from '../screens/send/ReviewTransferScreen';
import { PinConfirmScreen } from '../screens/send/PinConfirmScreen';
import { ProcessingScreen } from '../screens/send/ProcessingScreen';
import { SuccessScreen } from '../screens/send/SuccessScreen';
import { FailureScreen } from '../screens/send/FailureScreen';

const Stack = createNativeStackNavigator<SendMoneyStackParamList>();

export const SendMoneyNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SendHome" component={SendHomeScreen} />
      <Stack.Screen name="SelectRecipient" component={SelectRecipientScreen} />
      <Stack.Screen name="AddRecipient" component={AddRecipientScreen} />
      <Stack.Screen name="EnterAmount" component={EnterAmountScreen} />
      <Stack.Screen name="DeliveryMethod" component={DeliveryMethodScreen} />
      <Stack.Screen name="ReviewTransfer" component={ReviewTransferScreen} />
      <Stack.Screen name="PinConfirm" component={PinConfirmScreen} options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name="Processing" component={ProcessingScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
      <Stack.Screen name="Failure" component={FailureScreen} />
    </Stack.Navigator>
  );
};
