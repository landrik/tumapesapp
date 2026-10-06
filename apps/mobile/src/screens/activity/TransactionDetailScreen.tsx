import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ActivityStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransfer, cancelTransferThunk } from '../../store/slices/transferSlice';
import { TransferStatus } from '../../types/models';

type Props = NativeStackScreenProps<ActivityStackParamList, 'TransactionDetail'>;

const TIMELINE_STEPS: { key: string; label: string }[] = [
  { key: 'initiated', label: 'Initiated' },
  { key: 'processing', label: 'Processing' },
  { key: 'delivered', label: 'Delivered' },
];

const getCompletedStepCount = (status: TransferStatus): number => {
  switch (status) {
    case 'pending':
      return 1;
    case 'processing':
      return 2;
    case 'completed':
      return 3;
    default:
      return 1; // failed / cancelled stop at initiated
  }
};

export const TransactionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transferId } = route.params;
  const dispatch = useAppDispatch();
  const { current } = useAppSelector(state => state.transfers);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchTransfer(transferId));
  }, [dispatch, transferId]);

  if (!current || current._id !== transferId) {
    return <Loader label="Loading transfer..." />;
  }

  const completedSteps = getCompletedStepCount(current.status);
  const isTerminalFailure = current.status === 'failed' || current.status === 'cancelled';

  const handleCancel = () => {
    Alert.alert('Cancel transfer?', 'This cannot be undone.', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel transfer',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await dispatch(cancelTransferThunk(transferId)).unwrap();
          } catch (err) {
            Alert.alert('Could not cancel', typeof err === 'string' ? err : 'Please try again.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Transfer details" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.amount}>
            {current.sendCurrency} {current.sendAmount.toFixed(2)}
          </Text>
          <Text style={styles.recipient}>
            to {current.recipientSnapshot.firstName} {current.recipientSnapshot.lastName}
          </Text>
          <Text style={styles.reference}>Ref: {current.reference}</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Status</Text>
          {isTerminalFailure ? (
            <View style={styles.failureRow}>
              <Ionicons
                name={current.status === 'failed' ? 'close-circle' : 'ban'}
                size={20}
                color={current.status === 'failed' ? colors.error : colors.textSecondary}
              />
              <Text style={styles.failureText}>
                {current.status === 'failed' ? 'This transfer failed' : 'This transfer was cancelled'}
              </Text>
            </View>
          ) : (
            TIMELINE_STEPS.map((step, i) => {
              const done = i < completedSteps;
              return (
                <View key={step.key} style={styles.timelineRow}>
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={done ? colors.success : colors.border}
                  />
                  <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>{step.label}</Text>
                </View>
              );
            })
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Row label="Recipient gets" value={`${current.receiveCurrency} ${current.receiveAmount.toFixed(2)}`} />
          <Row label="Exchange rate" value={`1 ${current.sendCurrency} = ${current.rate.toFixed(2)} ${current.receiveCurrency}`} />
          <Row label="Fee" value={`${current.sendCurrency} ${current.fee.toFixed(2)}`} />
          <Row label="Total paid" value={`${current.sendCurrency} ${current.totalDebit.toFixed(2)}`} />
          <Row label="Estimated delivery" value={current.estimatedDelivery} />
          <Row label="Created" value={new Date(current.createdAt).toLocaleString()} />
          {current.completedAt ? (
            <Row label="Completed" value={new Date(current.completedAt).toLocaleString()} />
          ) : null}
        </Card>

        <Button
          label="View receipt"
          variant="outline"
          onPress={() => navigation.navigate('TransactionReceipt', { transferId })}
          style={styles.button}
        />

        {current.status === 'pending' ? (
          <Button label="Cancel transfer" variant="ghost" onPress={handleCancel} loading={cancelling} />
        ) : null}
      </ScrollView>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  card: { marginTop: 16 },
  amount: { fontSize: 26, fontWeight: '700', color: colors.text },
  recipient: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  reference: { fontSize: 12, color: colors.textSecondary, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  timelineLabel: { fontSize: 14, color: colors.textSecondary },
  timelineLabelDone: { color: colors.text, fontWeight: '500' },
  failureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  failureText: { fontSize: 14, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 13, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  button: { marginTop: 20, marginBottom: 8 },
});
