import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { DELIVERY_METHODS, RecipientDeliveryMethod } from '../../constants/deliveryMethods';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateDraft } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'DeliveryMethod'>;

export const DeliveryMethodScreen: React.FC<Props> = ({ navigation, route }) => {
  const { recipientId, sendAmount, sendCurrency, receiveCurrency } = route.params;
  const dispatch = useAppDispatch();
  const recipient = useAppSelector(state => state.recipients.items.find(r => r._id === recipientId));

  const [selected, setSelected] = useState<RecipientDeliveryMethod>(
    recipient?.deliveryMethod || 'bank_transfer'
  );

  const handleContinue = () => {
    dispatch(updateDraft({ deliveryMethod: selected }));
    navigation.navigate('ReviewTransfer', {
      recipientId,
      sendAmount,
      sendCurrency,
      receiveCurrency,
      deliveryMethod: selected,
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Delivery method" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>How should {recipient?.firstName || 'the recipient'} receive this transfer?</Text>

        {DELIVERY_METHODS.map(method => (
          <Button
            key={method.value}
            label={`${method.label} — ${method.description}`}
            variant={selected === method.value ? 'primary' : 'outline'}
            onPress={() => setSelected(method.value)}
            style={styles.methodButton}
          />
        ))}

        <Button label="Continue" onPress={handleContinue} style={styles.continueButton} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  methodButton: { marginBottom: 12 },
  continueButton: { marginTop: 12 },
});
