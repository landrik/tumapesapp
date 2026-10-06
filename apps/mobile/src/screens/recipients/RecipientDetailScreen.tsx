import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientsStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FlagIcon } from '../../components/common/FlagIcon';
import { Loader } from '../../components/common/Loader';
import { useAppSelector } from '../../store/hooks';
import { getDeliveryMethodLabel } from '../../constants/deliveryMethods';

type Props = NativeStackScreenProps<RecipientsStackParamList, 'RecipientDetail'>;

export const RecipientDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { recipientId } = route.params;
  const recipient = useAppSelector(state => state.recipients.items.find(r => r._id === recipientId));

  if (!recipient) {
    return <Loader label="Loading recipient..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Recipient"
        rightLabel="Edit"
        onRightPress={() => navigation.navigate('EditRecipient', { recipientId })}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.headerRow}>
            <FlagIcon countryCode={recipient.country} size={32} />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>
                {recipient.firstName} {recipient.lastName}
              </Text>
              {recipient.nickname ? <Text style={styles.nickname}>"{recipient.nickname}"</Text> : null}
            </View>
          </View>

          <View style={styles.divider} />

          <Row label="Country" value={recipient.country} />
          <Row label="Currency" value={recipient.currency} />
          {recipient.phone ? <Row label="Phone" value={recipient.phone} /> : null}
          <Row label="Delivery method" value={getDeliveryMethodLabel(recipient.deliveryMethod)} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Payout details</Text>

          {recipient.deliveryMethod === 'bank_transfer' ? (
            <>
              {recipient.bankName ? <Row label="Bank" value={recipient.bankName} /> : null}
              {recipient.accountName ? <Row label="Account name" value={recipient.accountName} /> : null}
              {recipient.accountNumber ? <Row label="Account number" value={recipient.accountNumber} /> : null}
              {recipient.ifscCode ? <Row label="IFSC code" value={recipient.ifscCode} /> : null}
              {recipient.sortCode ? <Row label="Sort code" value={recipient.sortCode} /> : null}
            </>
          ) : null}

          {recipient.deliveryMethod === 'mobile_money' ? (
            <>
              {recipient.mobileMoneyProvider ? <Row label="Provider" value={recipient.mobileMoneyProvider} /> : null}
              {recipient.mobileMoneyNumber ? <Row label="Number" value={recipient.mobileMoneyNumber} /> : null}
            </>
          ) : null}

          {recipient.deliveryMethod === 'cash_pickup' && recipient.cashPickupNetwork ? (
            <Row label="Network" value={recipient.cashPickupNetwork} />
          ) : null}
        </Card>

        <Button
          label="Edit recipient"
          variant="outline"
          onPress={() => navigation.navigate('EditRecipient', { recipientId })}
          style={styles.button}
        />
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  nickname: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  rowValue: { fontSize: 13, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right' },
  button: { marginTop: 20 },
});
