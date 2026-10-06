import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';
import { FlagIcon } from './FlagIcon';

interface PhoneInputProps {
  /** ISO 3166-1 alpha-2, for the flag — e.g. 'GB', 'NG'. */
  countryCode: string;
  /** Dial code with no leading '+' — e.g. '44', '234'. Comes from the
   * selected country, not typed by the user. */
  callingCode: string;
  /** The local number only (no country code) — what the user actually types. */
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  placeholder?: string;
}

/**
 * Composes a calling code + local number into the full phone string the
 * backend expects, e.g. ('44', '7700 900123') -> '+44 7700 900123'.
 */
export const composePhoneNumber = (callingCode: string, localNumber: string): string => {
  const trimmedLocal = localNumber.trim();
  if (!trimmedLocal) return '';
  return `+${callingCode} ${trimmedLocal}`;
};

/**
 * Best-effort split of a previously-stored full phone string (e.g. from an
 * existing user's profile) back into calling code + local number, so an
 * edit screen can pre-fill both parts. Falls back to treating the whole
 * value as the local number under `fallbackCallingCode` if it doesn't
 * start with '+', since free-text phone storage doesn't guarantee a
 * parseable format.
 */
export const splitPhoneNumber = (
  phone: string,
  fallbackCallingCode: string
): { callingCode: string; localNumber: string } => {
  const trimmed = phone.trim();
  if (!trimmed.startsWith('+')) {
    return { callingCode: fallbackCallingCode, localNumber: trimmed };
  }

  const withoutPlus = trimmed.slice(1);
  const firstSpace = withoutPlus.indexOf(' ');
  if (firstSpace === -1) {
    // No space to split on — can't reliably separate code from number,
    // so treat the whole thing as the local number under the fallback code.
    return { callingCode: fallbackCallingCode, localNumber: trimmed };
  }

  return {
    callingCode: withoutPlus.slice(0, firstSpace),
    localNumber: withoutPlus.slice(firstSpace + 1),
  };
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  callingCode,
  value,
  onChangeText,
  label,
  placeholder = '7700 900123',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}
      <View style={[styles.row, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={[styles.prefix, { borderRightColor: theme.border }]}>
          <FlagIcon countryCode={countryCode} size={20} />
          <Text style={[styles.callingCode, { color: theme.text }]}>+{callingCode}</Text>
        </View>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    borderRightWidth: 1,
    marginRight: 10,
  },
  callingCode: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
