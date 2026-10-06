import * as SecureStore from 'expo-secure-store';

const PIN_KEY = 'tumapesa_transaction_pin';

/**
 * NOTE: this PIN is purely a client-side confirmation gate before calling
 * POST /v1/transfers/:id/confirm — the backend has no concept of a
 * transaction PIN and never validates it. Real fund-movement authorization
 * still relies entirely on the JWT bearer token. This exists to demonstrate
 * the UX pattern described in the README (6-digit PIN pad with shake
 * animation), not as an actual security boundary.
 */
export const hasPinConfigured = async (): Promise<boolean> => {
  const pin = await SecureStore.getItemAsync(PIN_KEY);
  return Boolean(pin);
};

export const setTransactionPin = async (pin: string): Promise<void> => {
  await SecureStore.setItemAsync(PIN_KEY, pin);
};

export const clearTransactionPin = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(PIN_KEY);
};

/**
 * Verifies a PIN. If no PIN has been configured yet, the first entry is
 * accepted and saved as the PIN going forward (simplified first-run setup).
 */
export const verifyTransactionPin = async (pin: string): Promise<boolean> => {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  if (!stored) {
    await setTransactionPin(pin);
    return true;
  }
  return stored === pin;
};
