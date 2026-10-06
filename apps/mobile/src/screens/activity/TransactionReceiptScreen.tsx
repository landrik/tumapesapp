import React, { useEffect } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransfer } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<ActivityStackParamList, 'TransactionReceipt'>;

export const TransactionReceiptScreen: React.FC<Props> = ({ route }) => {
  const { transferId } = route.params;
  const dispatch = useAppDispatch();
  const { current } = useAppSelector(state => state.transfers);

  useEffect(() => {
    dispatch(fetchTransfer(transferId));
  }, [dispatch, transferId]);

  if (!current || current._id !== transferId) {
    return <Loader label="Loading receipt..." />;
  }

  const handleShare = async () => {
    const lines = [
      'TumaPesa transfer receipt',
      `Reference: ${current.reference}`,
      `To: ${current.recipientSnapshot.firstName} ${current.recipientSnapshot.lastName}`,
      `Sent: ${current.sendCurrency} ${current.sendAmount.toFixed(2)}`,
      `Received: ${current.receiveCurrency} ${current.receiveAmount.toFixed(2)}`,
      `Rate: 1 ${current.sendCurrency} = ${current.rate.toFixed(2)} ${current.receiveCurrency}`,
      `Fee: ${current.sendCurrency} ${current.fee.toFixed(2)}`,
      `Total: ${current.sendCurrency} ${current.totalDebit.toFixed(2)}`,
      `Status: ${current.status}`,
      `Date: ${new Date(current.createdAt).toLocaleString()}`,
    ];

    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      // User dismissed the share sheet — nothing to handle.
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Receipt" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.brand}>TumaPesa</Text>
          <Text style={styles.reference}>{current.reference}</Text>

          <View style={styles.divider} />

          <Row label="Recipient" value={`${current.recipientSnapshot.firstName} ${current.recipientSnapshot.lastName}`} />
          <Row label="Country" value={current.recipientSnapshot.country} />
          <Row label="Delivery" value={current.deliveryMethod} />

          <View style={styles.divider} />

          <Row label="You sent" value={`${current.sendCurrency} ${current.sendAmount.toFixed(2)}`} />
          <Row label="Fee" value={`${current.sendCurrency} ${current.fee.toFixed(2)}`} />
          <Row label="Exchange rate" value={`${current.rate.toFixed(2)}`} />
          <Row label="They received" value={`${current.receiveCurrency} ${current.receiveAmount.toFixed(2)}`} />

          <View style={styles.divider} />

          <Row label="Total paid" value={`${current.sendCurrency} ${current.totalDebit.toFixed(2)}`} bold />
          <Row label="Status" value={current.status} />
          <Row label="Date" value={new Date(current.createdAt).toLocaleString()} />
        </Card>

        <Button label="Share receipt" onPress={handleShare} style={styles.button} />
      </ScrollView>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, bold && styles.rowValueBold]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  brand: { fontSize: 18, fontWeight: '800', color: colors.primary },
  reference: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  rowLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 13, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  rowValueBold: { fontWeight: '700', fontSize: 15 },
  button: { marginTop: 20 },
});
