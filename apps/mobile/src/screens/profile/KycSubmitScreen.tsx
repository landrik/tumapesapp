import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { KycFlowScreen } from '../shared/KycFlowScreen';

type Props = NativeStackScreenProps<ProfileStackParamList, 'KycSubmit'>;

export const KycSubmitScreen: React.FC<Props> = ({ navigation }) => {
  return <KycFlowScreen onComplete={() => navigation.goBack()} />;
};
