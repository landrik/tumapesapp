import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { PinEntryModal } from '../../components/modals/PinEntryModal';
import {
  getBiometricCapability,
  getBiometricLabel,
  promptBiometricAuth,
} from '../../utils/biometrics';
import { clearTransactionPin, hasPinConfigured, setTransactionPin } from '../../utils/pin';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Security'>;

export const SecurityScreen: React.FC<Props> = () => {
  const [biometricLabel, setBiometricLabel] = useState('Biometrics');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinConfigured, setPinConfigured] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const capability = await getBiometricCapability();
      setBiometricAvailable(capability.available && capability.enrolled);
      setBiometricLabel(getBiometricLabel(capability.supportedTypes));
      setPinConfigured(await hasPinConfigured());
    })();
  }, []);

  const handleToggleBiometric = async (value: boolean) => {
    if (!value) {
      setBiometricEnabled(false);
      return;
    }
    const result = await promptBiometricAuth(`Enable ${biometricLabel} for this app`);
    if (result.success) {
      setBiometricEnabled(true);
    } else {
      Alert.alert('Could not enable', result.error || 'Authentication failed');
    }
  };

  const handleResetPin = async () => {
    await clearTransactionPin();
    setPinConfigured(false);
    setPinModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Header title="Security" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>{biometricLabel} login</Text>
            <Text style={styles.description}>
              {biometricAvailable
                ? `Use ${biometricLabel} to unlock the app`
                : 'Not available or not set up on this device'}
            </Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={handleToggleBiometric}
            disabled={!biometricAvailable}
            trackColor={{ true: colors.primary, false: colors.border }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.label}>Transaction PIN</Text>
            <Text style={styles.description}>
              {pinConfigured ? 'A PIN is set for confirming transfers' : 'No PIN set yet'}
            </Text>
          </View>
        </View>

        <Button
          label={pinConfigured ? 'Change PIN' : 'Set a PIN'}
          variant="outline"
          onPress={pinConfigured ? handleResetPin : () => setPinModalVisible(true)}
          style={styles.button}
        />

        <Text style={styles.note}>
          Note: the transaction PIN is stored on this device only. It gates the confirm step in the
          app but isn't verified by the server.
        </Text>
      </ScrollView>

      <PinEntryModal
        visible={pinModalVisible}
        onClose={() => setPinModalVisible(false)}
        onSubmit={async (pin) => {
          await setTransactionPin(pin);
          return true;
        }}
        onSuccess={() => {
          setPinConfigured(true);
          setPinModalVisible(false);
        }}
        title="Choose a 6-digit PIN"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1, paddingRight: 12 },
  label: { fontSize: 15, fontWeight: '500', color: colors.text },
  description: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  button: { marginTop: 20 },
  note: { fontSize: 12, color: colors.textSecondary, marginTop: 16, lineHeight: 18 },
});
