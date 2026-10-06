import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import CountryPicker, { Country, CountryCode, getCallingCode } from 'react-native-country-picker-modal';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { PhoneInput, composePhoneNumber, splitPhoneNumber } from '../../components/common/PhoneInput';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateAuthUser } from '../../store/slices/authSlice';
import { updateMe } from '../../api/users';
import { getApiErrorMessage } from '../../api/client';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [countryCode, setCountryCode] = useState<CountryCode>((user?.country as CountryCode) || 'GB');
  const [currency, setCurrency] = useState(user?.currency || '');
  const [callingCode, setCallingCode] = useState('44');
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const [phoneInitialized, setPhoneInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The stored phone is a single free-text string (e.g. "+44 7700 900123").
  // To edit it as calling-code + local-number, we first need to know the
  // calling code for the user's CURRENT country (since they haven't
  // re-picked it yet this session) — getCallingCode() gives us that
  // without needing to render/open the picker.
  useEffect(() => {
    (async () => {
      const initialCallingCode = (await getCallingCode(countryCode)) || '44';
      setCallingCode(initialCallingCode);
      if (user?.phone) {
        const split = splitPhoneNumber(user.phone, initialCallingCode);
        setCallingCode(split.callingCode);
        setLocalPhoneNumber(split.localNumber);
      }
      setPhoneInitialized(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  const handleSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    const derivedCurrency = country.currency?.[0];
    if (derivedCurrency) setCurrency(derivedCurrency);
    const derivedCallingCode = country.callingCode?.[0];
    if (derivedCallingCode) setCallingCode(derivedCallingCode);
  };

  const handleSave = async () => {
    const phone = composePhoneNumber(callingCode, localPhoneNumber);
    if (!phone) {
      setError('Phone number is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMe({
        firstName,
        lastName,
        phone,
        country: countryCode,
        currency: currency.toUpperCase(),
      });
      dispatch(updateAuthUser(updated));
      navigation.goBack();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Edit profile" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="First name" value={firstName} onChangeText={setFirstName} />
        <Input label="Last name" value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Country</Text>
        <CountryPicker
          countryCode={countryCode}
          withFlag
          withFilter
          withCallingCode
          withCountryNameButton
          onSelect={handleSelectCountry}
          containerButtonStyle={styles.countryPickerButton}
        />

        {phoneInitialized ? (
          <PhoneInput
            label="Phone number"
            countryCode={countryCode}
            callingCode={callingCode}
            value={localPhoneNumber}
            onChangeText={setLocalPhoneNumber}
          />
        ) : null}

        <Input label="Currency" value={currency} onChangeText={setCurrency} autoCapitalize="characters" />

        <Text style={styles.note}>
          Your email address can't be changed here. Changing country updates the phone number's
          calling code automatically.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Save changes" onPress={handleSave} loading={saving} style={styles.button} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8, marginTop: 4 },
  countryPickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  note: { fontSize: 12, color: colors.textSecondary, marginBottom: 12, lineHeight: 17 },
  error: { color: colors.error, fontSize: 13, marginBottom: 12 },
  button: { marginTop: 4 },
});
