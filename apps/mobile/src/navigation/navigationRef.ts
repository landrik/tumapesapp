import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigateToTransfer = (transferId: string): void => {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('Main', {
    screen: 'Activity',
    params: { screen: 'TransactionDetail', params: { transferId } },
  });
};
