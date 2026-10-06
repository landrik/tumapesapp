import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../../types/navigation';
import { PinEntryModal } from '../../components/modals/PinEntryModal';
import { verifyTransactionPin } from '../../utils/pin';
import { useAppDispatch } from '../../store/hooks';
import { confirmTransferThunk } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'PinConfirm'>;

export const PinConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transferDraftId } = route.params;
  const dispatch = useAppDispatch();

  const handleSuccess = async () => {
    try {
      await dispatch(confirmTransferThunk(transferDraftId)).unwrap();
      navigation.replace('Processing', { transferId: transferDraftId });
    } catch (err) {
      navigation.replace('Failure', {
        message: typeof err === 'string' ? err : 'Could not confirm the transfer',
      });
    }
  };

  return (
    <View style={styles.container}>
      <PinEntryModal
        visible
        onClose={() => navigation.goBack()}
        onSubmit={verifyTransactionPin}
        onSuccess={handleSuccess}
        title="Confirm with your PIN"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
});
