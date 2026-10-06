import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FeeBreakdownModal } from '../../components/modals/FeeBreakdownModal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { submitTransfer } from '../../store/slices/transferSlice';
import { getDeliveryMethodLabel } from '../../constants/deliveryMethods';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'ReviewTransfer'>;

export const ReviewTransferScreen: React.FC<Props> = ({ navigation, route }) => {
  const { recipientId, sendAmount, sendCurrency, receiveCurrency, deliveryMethod } = route.params;
  const dispatch = useAppDispatch();
  const recipient = useAppSelector(state => state.recipients.items.find(r => r._id === recipientId));
  const { quote } = useExchangeRate(sendCurrency, receiveCurrency);

  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rate = quote?.rate || 0;
  const fee = quote?.fee || 0;
  const receiveAmount = sendAmount * rate;
  const totalDebit = sendAmount + fee;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const transfer = await dispatch(
        submitTransfer({ sendAmount, sendCurrency, receiveCurrency, recipientId, deliveryMethod })
      ).unwrap();
      navigation.navigate('PinConfirm', { transferDraftId: transfer._id });
    } catch (err) {
      navigation.navigate('Failure', {
        message: typeof err === 'string' ? err : 'Could not create the transfer',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Review transfer" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.recipientName}>
            {recipient?.firstName} {recipient?.lastName}
          </Text>
          <Text style={styles.recipientMeta}>
            {recipient?.country} · {getDeliveryMethodLabel(deliveryMethod as any)}
          </Text>

          <View style={styles.divider} />

          <Row label="You send" value={`${sendCurrency} ${sendAmount.toFixed(2)}`} />
          <Row label="Fee" value={`${sendCurrency} ${fee.toFixed(2)}`} />
          <Row label="Recipient gets" value={`${receiveCurrency} ${receiveAmount.toFixed(2)}`} />

          <TouchableOpacity onPress={() => setFeeModalVisible(true)}>
            <Text style={styles.feeLink}>View full fee breakdown</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Row label="Total to pay" value={`${sendCurrency} ${totalDebit.toFixed(2)}`} bold />
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Confirm and continue" onPress={handleConfirm} loading={submitting} style={styles.button} />
      </ScrollView>

      <FeeBreakdownModal
        visible={feeModalVisible}
        onClose={() => setFeeModalVisible(false)}
        sendAmount={sendAmount}
        sendCurrency={sendCurrency}
        fee={fee}
        rate={rate}
        receiveAmount={receiveAmount}
        receiveCurrency={receiveCurrency}
        totalDebit={totalDebit}
      />
    </View>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <View style={styles.row}>
    <Text style={[styles.rowLabel, bold && styles.rowLabelBold]}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.rowLabelBold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  recipientName: { fontSize: 17, fontWeight: '700', color: colors.text },
  recipientMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 14, color: colors.textSecondary },
  rowValue: { fontSize: 14, color: colors.text, fontWeight: '500' },
  rowLabelBold: { fontWeight: '700', color: colors.text, fontSize: 15 },
  feeLink: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 8 },
  error: { color: colors.error, fontSize: 13, marginTop: 16 },
  button: { marginTop: 20 },
});
