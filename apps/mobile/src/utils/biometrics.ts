import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricCapability {
  available: boolean;
  enrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export const getBiometricCapability = async (): Promise<BiometricCapability> => {
  const available = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
  return { available, enrolled, supportedTypes };
};

export const getBiometricLabel = (types: LocalAuthentication.AuthenticationType[]): string => {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris scan';
  return 'Biometrics';
};

export interface BiometricPromptResult {
  success: boolean;
  error?: string;
}

export const promptBiometricAuth = async (
  reason = 'Confirm your identity to continue'
): Promise<BiometricPromptResult> => {
  const capability = await getBiometricCapability();
  if (!capability.available || !capability.enrolled) {
    return { success: false, error: 'Biometric authentication is not set up on this device' };
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });

  if (result.success) return { success: true };
  return { success: false, error: 'error' in result ? result.error : 'Authentication failed' };
};
