import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { PhoneInput, composePhoneNumber } from '../../components/common/PhoneInput';
import { useAuth } from '../../hooks/useAuth';
import { UserDeliveryMethod } from '../../types/models';

type Props = NativeStackScreenProps<AuthStackParamList, 'Address'>;

interface RegistrationDraft {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const AddressScreen: React.FC<Props> = ({ route }) => {
  const draft = route.params.registrationDraft as unknown as RegistrationDraft;
  const { register, isLoading } = useAuth();

  const [countryCode, setCountryCode] = useState<CountryCode>('GB');
  const [countryName, setCountryName] = useState('United Kingdom');
  const [callingCode, setCallingCode] = useState('44');
  const [currency, setCurrency] = useState('GBP');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<UserDeliveryMethod>('bank_transfer');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  // The phone field's country code is driven entirely by this selection —
  // there's no separate "country code" input to keep in sync, so it can
  // never drift from the country the user actually picked.
  const handleSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCountryName(typeof country.name === 'string' ? country.name : country.name.common);
    const derivedCurrency = country.currency?.[0];
    if (derivedCurrency) setCurrency(derivedCurrency);
    const derivedCallingCode = country.callingCode?.[0];
    if (derivedCallingCode) setCallingCode(derivedCallingCode);
    setPickerVisible(false);
  };

  const handleSubmit = async () => {
    const phone = composePhoneNumber(callingCode, localPhoneNumber);
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    if (deliveryMethod === 'mobile_money' && (!mobileMoneyProvider || !mobileMoneyNumber)) {
      setError('Mobile money provider and number are required');
      return;
    }
    setError(null);

    try {
      await register({
        email: draft.email,
        password: draft.password,
        firstName: draft.firstName,
        lastName: draft.lastName,
        phone,
        country: countryCode,
        currency,
        deliveryMethod,
        mobileMoneyProvider: deliveryMethod === 'mobile_money' ? mobileMoneyProvider : undefined,
        mobileMoneyNumber:
          deliveryMethod === 'mobile_money'
            ? composePhoneNumber(callingCode, mobileMoneyNumber)
            : undefined,
      });
      // No further navigation needed: RootNavigator watches the token +
      // kycPromptPending flag and will show the KYC prompt automatically.
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not create your account. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Where are you based?" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Step 3 of 3</Text>

        <Text style={styles.label}>Country</Text>
        <Button
          label={countryName}
          variant="outline"
          onPress={() => setPickerVisible(true)}
          style={styles.countryButton}
        />
        <CountryPicker
          visible={pickerVisible}
          countryCode={countryCode}
          withFilter
          withFlag
          withCallingCode
          onSelect={handleSelectCountry}
          onClose={() => setPickerVisible(false)}
        />

        <Input label="Currency" value={currency} onChangeText={setCurrency} autoCapitalize="characters" placeholder="GBP" />

        <PhoneInput
          label="Phone number"
          countryCode={countryCode}
          callingCode={callingCode}
          value={localPhoneNumber}
          onChangeText={setLocalPhoneNumber}
        />

        <Text style={styles.label}>How should recipients get paid from you? (your own delivery preference)</Text>
        <Button
          label={deliveryMethod === 'bank_transfer' ? 'Bank transfer' : 'Mobile money'}
          variant="outline"
          onPress={() => setDeliveryMethod(prev => (prev === 'bank_transfer' ? 'mobile_money' : 'bank_transfer'))}
          style={styles.countryButton}
        />

        {deliveryMethod === 'mobile_money' ? (
          <>
            <Input
              label="Mobile money provider"
              value={mobileMoneyProvider}
              onChangeText={setMobileMoneyProvider}
              placeholder="MTN Mobile Money"
            />
            <PhoneInput
              label="Mobile money number"
              countryCode={countryCode}
              callingCode={callingCode}
              value={mobileMoneyNumber}
              onChangeText={setMobileMoneyNumber}
            />
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Create account" onPress={handleSubmit} loading={isLoading} style={styles.button} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8, marginTop: 4 },
  countryButton: { marginBottom: 16, alignSelf: 'stretch' },
  error: { color: colors.error, fontSize: 13, marginBottom: 12 },
  button: { marginTop: 4 },
});
