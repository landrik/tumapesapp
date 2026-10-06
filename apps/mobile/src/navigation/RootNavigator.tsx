import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { bootstrapAuth, dismissKycPrompt } from '../store/slices/authSlice';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { Loader } from '../components/common/Loader';
import { navigationRef } from './navigationRef';
import { KycFlowScreen } from '../screens/shared/KycFlowScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, bootstrapped, kycPromptPending } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  if (!bootstrapped) {
    return <Loader label="Loading..." />;
  }

  // Shown once, right after registration, before falling through to the
  // Main tabs. This has to live outside AuthNavigator/MainTabNavigator:
  // the moment `token` is set the gate below would otherwise switch
  // straight to Main, and the KYC step would never actually be reachable.
  if (token && kycPromptPending) {
    return <KycFlowScreen onComplete={() => dispatch(dismissKycPrompt())} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
