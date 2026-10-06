import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientsStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { PhoneInput, composePhoneNumber, splitPhoneNumber } from '../../components/common/PhoneInput';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { editRecipient } from '../../store/slices/recipientSlice';
import { listCountries } from '../../api/countries';

type Props = NativeStackScreenProps<RecipientsStackParamList, 'EditRecipient'>;

export const EditRecipientScreen: React.FC<Props> = ({ navigation, route }) => {
  const { recipientId } = route.params;
  const dispatch = useAppDispatch();
  const recipient = useAppSelector(state => state.recipients.items.find(r => r._id === recipientId));

  const [firstName, setFirstName] = useState(recipient?.firstName || '');
  const [lastName, setLastName] = useState(recipient?.lastName || '');
  const [nickname, setNickname] = useState(recipient?.nickname || '');
  const [callingCode, setCallingCode] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [phoneInitialized, setPhoneInitialized] = useState(false);
  const [bankName, setBankName] = useState(recipient?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(recipient?.accountNumber || '');
  const [accountName, setAccountName] = useState(recipient?.accountName || '');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState(recipient?.mobileMoneyProvider || '');
  const [mobileMoneyNumberLocal, setMobileMoneyNumberLocal] = useState('');
  const [cashPickupNetwork, setCashPickupNetwork] = useState(recipient?.cashPickupNetwork || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A recipient's country is fixed after creation (see the note below), so
  // its calling code is knowable without a picker — just look it up from
  // the same supported-countries list AddRecipientScreen uses, then split
  // the previously-stored phone strings back into calling code + local
  // number so they can be edited the same way they were entered.
  useEffect(() => {
    if (!recipient) return;
    (async () => {
      try {
        const countries = await listCountries();
        const match = countries.find(c => c.code.toUpperCase() === recipient.country.toUpperCase());
        const code = match?.callingCode || '';
        setCallingCode(code);

        if (recipient.phone) {
          setPhoneLocal(splitPhoneNumber(recipient.phone, code).localNumber);
        }
        if (recipient.mobileMoneyNumber) {
          setMobileMoneyNumberLocal(splitPhoneNumber(recipient.mobileMoneyNumber, code).localNumber);
        }
      } finally {
        setPhoneInitialized(true);
      }
    })();
  }, [recipient]);

  if (!recipient) {
    return <Loader label="Loading recipient..." />;
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Note: the backend's PATCH /v1/recipients/:id only accepts these
      // fields — country, currency, and deliveryMethod are deliberately
      // not updatable, so they're read-only here too.
      await dispatch(
        editRecipient({
          id: recipientId,
          payload: {
            firstName,
            lastName,
            nickname,
            phone: composePhoneNumber(callingCode, phoneLocal),
            bankName,
            accountNumber,
            accountName,
            mobileMoneyProvider,
            mobileMoneyNumber: composePhoneNumber(callingCode, mobileMoneyNumberLocal),
            cashPickupNetwork,
          },
        })
      ).unwrap();
      navigation.goBack();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Edit recipient" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="First name" value={firstName} onChangeText={setFirstName} />
        <Input label="Last name" value={lastName} onChangeText={setLastName} />
        <Input label="Nickname" value={nickname} onChangeText={setNickname} placeholder="Mum" />

        {phoneInitialized ? (
          <PhoneInput
            label="Phone"
            countryCode={recipient.country}
            callingCode={callingCode}
            value={phoneLocal}
            onChangeText={setPhoneLocal}
          />
        ) : null}

        {recipient.deliveryMethod === 'bank_transfer' ? (
          <>
            <Input label="Bank name" value={bankName} onChangeText={setBankName} />
            <Input label="Account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
            <Input label="Account name" value={accountName} onChangeText={setAccountName} />
          </>
        ) : null}

        {recipient.deliveryMethod === 'mobile_money' && phoneInitialized ? (
          <>
            <Input label="Mobile money provider" value={mobileMoneyProvider} onChangeText={setMobileMoneyProvider} />
            <PhoneInput
              label="Mobile money number"
              countryCode={recipient.country}
              callingCode={callingCode}
              value={mobileMoneyNumberLocal}
              onChangeText={setMobileMoneyNumberLocal}
            />
          </>
        ) : null}

        {recipient.deliveryMethod === 'cash_pickup' ? (
          <Input label="Cash pickup network" value={cashPickupNetwork} onChangeText={setCashPickupNetwork} />
        ) : null}

        <Text style={styles.note}>Country, currency, and delivery method can't be changed after creation.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Save changes" onPress={handleSave} loading={saving} style={styles.button} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  note: { fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  error: { color: colors.error, fontSize: 13, marginBottom: 12 },
  button: { marginBottom: 32 },
});
