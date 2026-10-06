import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { CurrencyInput } from '../../components/common/CurrencyInput';
import { Button } from '../../components/common/Button';
import { ExchangeRateModal } from '../../components/modals/ExchangeRateModal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { updateDraft } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'EnterAmount'>;

export const EnterAmountScreen: React.FC<Props> = ({ navigation, route }) => {
  const { recipientId } = route.params;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const recipient = useAppSelector(state => state.recipients.items.find(r => r._id === recipientId));

  const sendCurrency = user?.currency || 'GBP';
  const receiveCurrency = recipient?.currency || 'KES';

  const [amount, setAmount] = useState('');
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const { quote, isStale, isLoading, error } = useExchangeRate(sendCurrency, receiveCurrency);

  useEffect(() => {
    dispatch(updateDraft({ sendCurrency, receiveCurrency }));
  }, [dispatch, sendCurrency, receiveCurrency]);

  const numericAmount = parseFloat(amount) || 0;
  const receiveAmount = quote ? numericAmount * quote.rate : 0;

  const handleContinue = () => {
    if (numericAmount <= 0) return;
    dispatch(updateDraft({ sendAmount: numericAmount }));
    navigation.navigate('DeliveryMethod', {
      recipientId,
      sendAmount: numericAmount,
      sendCurrency,
      receiveCurrency,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Enter amount" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.recipientLabel}>
          Sending to {recipient ? `${recipient.firstName} ${recipient.lastName}` : '...'}
        </Text>

        <CurrencyInput currencyCode={sendCurrency} value={amount} onChangeText={setAmount} label="You send" />

        {quote ? (
          <CurrencyInput
            currencyCode={receiveCurrency}
            value={receiveAmount.toFixed(2)}
            onChangeText={() => undefined}
            editable={false}
            label="Recipient gets"
          />
        ) : null}

        {quote ? (
          <TouchableOpacity onPress={() => setRateModalVisible(true)} style={styles.rateRow}>
            <Text style={styles.rateText}>
              1 {sendCurrency} = {quote.rate.toFixed(2)} {receiveCurrency}
              {isStale ? ' (updating...)' : ''}
            </Text>
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label="Continue"
          onPress={handleContinue}
          disabled={numericAmount <= 0 || isLoading || !quote}
          style={styles.button}
        />
      </ScrollView>

      {quote ? (
        <ExchangeRateModal
          visible={rateModalVisible}
          onClose={() => setRateModalVisible(false)}
          from={sendCurrency}
          to={receiveCurrency}
          rate={quote.rate}
          updatedAt={quote.updatedAt}
          isStale={isStale}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  recipientLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  rateRow: { alignSelf: 'flex-start', marginBottom: 20 },
  rateText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  error: { color: colors.error, fontSize: 13, marginBottom: 12 },
  button: { marginTop: 12 },
});
