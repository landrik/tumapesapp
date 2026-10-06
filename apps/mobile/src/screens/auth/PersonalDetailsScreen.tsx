import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';

type Props = NativeStackScreenProps<AuthStackParamList, 'PersonalDetails'>;

// Phone number collection moved to AddressScreen (next step), since its
// country code should be derived automatically from the country selected
// there — collecting it here, before a country exists, would leave nothing
// to derive the calling code from.
export const PersonalDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, password } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (!firstName || !lastName) {
      setError('First and last name are required');
      return;
    }
    setError(null);
    navigation.navigate('Address', {
      registrationDraft: { email, password, firstName, lastName },
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Personal details" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Step 2 of 3</Text>

        <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Jane" />
        <Input label="Last name" value={lastName} onChangeText={setLastName} placeholder="Smith" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Continue" onPress={handleNext} style={styles.button} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  error: { color: colors.error, fontSize: 13, marginBottom: 12 },
  button: { marginTop: 4 },
});
