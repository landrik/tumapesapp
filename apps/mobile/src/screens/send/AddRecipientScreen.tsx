import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SendMoneyStackParamList } from '../../types/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FlagIcon } from '../../components/common/FlagIcon';
import { Loader } from '../../components/common/Loader';
import { PhoneInput, composePhoneNumber } from '../../components/common/PhoneInput';
import { DELIVERY_METHODS, RecipientDeliveryMethod } from '../../constants/deliveryMethods';
import { useAppDispatch } from '../../store/hooks';
import { addRecipient } from '../../store/slices/recipientSlice';
import { updateDraft } from '../../store/slices/transferSlice';
import { listCountries } from '../../api/countries';
import { getApiErrorMessage } from '../../api/client';
import { Country } from '../../types/models';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'AddRecipient'>;

export const AddRecipientScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<RecipientDeliveryMethod>('bank_transfer');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('');
  const [mobileMoneyNumberLocal, setMobileMoneyNumberLocal] = useState('');
  const [cashPickupNetwork, setCashPickupNetwork] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The list of countries — and therefore currencies AND calling codes —
  // the app can actually pay a recipient in comes from the backend
  // (GET /v1/countries), which derives it from the same corridor data that
  // powers rates. This keeps the picker from ever offering a country with
  // no matching rate, and means the phone prefix below is always correct
  // for whichever country is selected, never manually typed.
  useEffect(() => {
    (async () => {
      try {
        const items = await listCountries();
        setCountries(items);
      } catch (err) {
        setCountriesError(getApiErrorMessage(err));
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !selectedCountry) {
      setError('Name and country are required');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // Currency is NOT sent — the backend derives it from `country` and
      // would ignore a client-supplied value anyway. Sending only the
      // country code keeps this screen from ever being able to submit a
      // mismatched country/currency pair.
      const recipient = await dispatch(
        addRecipient({
          firstName,
          lastName,
          country: selectedCountry.code,
          phone: composePhoneNumber(selectedCountry.callingCode, phoneLocal) || undefined,
          deliveryMethod,
          bankName: deliveryMethod === 'bank_transfer' ? bankName : undefined,
          accountNumber: deliveryMethod === 'bank_transfer' ? accountNumber : undefined,
          accountName: deliveryMethod === 'bank_transfer' ? accountName : undefined,
          mobileMoneyProvider: deliveryMethod === 'mobile_money' ? mobileMoneyProvider : undefined,
          mobileMoneyNumber:
            deliveryMethod === 'mobile_money'
              ? composePhoneNumber(selectedCountry.callingCode, mobileMoneyNumberLocal) || undefined
              : undefined,
          cashPickupNetwork: deliveryMethod === 'cash_pickup' ? cashPickupNetwork : undefined,
        })
      ).unwrap();

      dispatch(updateDraft({ recipientId: recipient._id }));
      navigation.navigate('EnterAmount', { recipientId: recipient._id });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Could not add recipient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Add recipient" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Amara" />
        <Input label="Last name" value={lastName} onChangeText={setLastName} placeholder="Okafor" />

        <Text style={[styles.label, { color: theme.text }]}>Country</Text>
        {countriesLoading ? (
          <Loader fullScreen={false} />
        ) : countriesError ? (
          <Text style={[styles.error, { color: theme.error }]}>{countriesError}</Text>
        ) : (
          <TouchableOpacity
            style={[styles.countryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={() => setPickerVisible(true)}
          >
            {selectedCountry ? (
              <View style={styles.countryButtonContent}>
                <FlagIcon countryCode={selectedCountry.code} size={22} />
                <Text style={[styles.countryButtonText, { color: theme.text }]}>
                  {selectedCountry.name} · {selectedCountry.currency}
                </Text>
              </View>
            ) : (
              <Text style={[styles.countryPlaceholder, { color: theme.textSecondary }]}>Select a country</Text>
            )}
            <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        )}

        {selectedCountry ? (
          <Text style={[styles.currencyNote, { color: theme.textSecondary }]}>
            Recipients in {selectedCountry.name} are paid in {selectedCountry.currency} and their
            phone number's country code (+{selectedCountry.callingCode}) is set automatically —
            both based on the country you picked above.
          </Text>
        ) : null}

        <PhoneInput
          label="Phone (optional)"
          countryCode={selectedCountry?.code || 'GB'}
          callingCode={selectedCountry?.callingCode || ''}
          value={phoneLocal}
          onChangeText={setPhoneLocal}
        />

        <Text style={[styles.label, { color: theme.text }]}>Delivery method</Text>
        {DELIVERY_METHODS.map(method => (
          <Button
            key={method.value}
            label={method.label}
            variant={deliveryMethod === method.value ? 'primary' : 'outline'}
            onPress={() => setDeliveryMethod(method.value)}
            style={styles.methodButton}
          />
        ))}

        {deliveryMethod === 'bank_transfer' ? (
          <>
            <Input label="Bank name" value={bankName} onChangeText={setBankName} placeholder="First Bank of Nigeria" />
            <Input label="Account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" />
            <Input label="Account name" value={accountName} onChangeText={setAccountName} />
          </>
        ) : null}

        {deliveryMethod === 'mobile_money' ? (
          <>
            <Input label="Mobile money provider" value={mobileMoneyProvider} onChangeText={setMobileMoneyProvider} placeholder="MTN Mobile Money" />
            <PhoneInput
              label="Mobile money number"
              countryCode={selectedCountry?.code || 'GB'}
              callingCode={selectedCountry?.callingCode || ''}
              value={mobileMoneyNumberLocal}
              onChangeText={setMobileMoneyNumberLocal}
            />
          </>
        ) : null}

        {deliveryMethod === 'cash_pickup' ? (
          <Input label="Cash pickup network" value={cashPickupNetwork} onChangeText={setCashPickupNetwork} placeholder="Western Union" />
        ) : null}

        {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}

        <Button label="Save recipient" onPress={handleSubmit} loading={submitting} style={styles.submitButton} />
      </ScrollView>

      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Select a country</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {countries.map(country => (
                <TouchableOpacity
                  key={country.code}
                  style={[styles.countryRow, { borderBottomColor: theme.border }]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setPickerVisible(false);
                  }}
                >
                  <FlagIcon countryCode={country.code} size={24} />
                  <Text style={[styles.countryRowText, { color: theme.text }]}>{country.name}</Text>
                  <Text style={[styles.countryRowCurrency, { color: theme.textSecondary }]}>
                    {country.currency} · +{country.callingCode}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8, marginTop: 4 },
  methodButton: { marginBottom: 8 },
  error: { fontSize: 13, marginVertical: 8 },
  submitButton: { marginTop: 12, marginBottom: 32 },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 4,
  },
  countryButtonContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countryButtonText: { fontSize: 15, fontWeight: '500' },
  countryPlaceholder: { fontSize: 15 },
  currencyNote: { fontSize: 12, marginBottom: 16, lineHeight: 17 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  countryRowText: { flex: 1, fontSize: 15 },
  countryRowCurrency: { fontSize: 13, fontWeight: '600' },
});
