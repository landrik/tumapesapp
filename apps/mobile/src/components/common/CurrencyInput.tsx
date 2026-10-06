import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';
import { FlagIcon } from './FlagIcon';

// Maps the currency codes used by the backend's corridor data
// (src/data/rates.ts) to a representative country code for the flag.
const CURRENCY_TO_COUNTRY: Record<string, string> = {
  GBP: 'GB',
  USD: 'US',
  KES: 'KE',
  NGN: 'NG',
  GHS: 'GH',
  ZAR: 'ZA',
  UGX: 'UG',
  TZS: 'TZ',
  PHP: 'PH',
  INR: 'IN',
  PKR: 'PK',
  BDT: 'BD',
};

interface CurrencyInputProps {
  currencyCode: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  label?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  currencyCode,
  value,
  onChangeText,
  placeholder = '0.00',
  editable = true,
  label,
}) => {
  const { theme } = useTheme();
  const countryCode = CURRENCY_TO_COUNTRY[currencyCode] || 'GB';

  const handleChange = (text: string) => {
    // Allow digits and a single decimal point only.
    const sanitized = text.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    const normalized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;
    onChangeText(normalized);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}
      <View style={[styles.row, { borderColor: theme.border, backgroundColor: theme.surface }]}>
        <View style={[styles.prefix, { borderRightColor: theme.border }]}>
          <FlagIcon countryCode={countryCode} size={22} />
          <Text style={[styles.currencyCode, { color: theme.text }]}>{currencyCode}</Text>
        </View>
        <TextInput
          style={[styles.amount, { color: theme.text }]}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          editable={editable}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
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
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 56,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    borderRightWidth: 1,
    marginRight: 10,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
  amount: {
    flex: 1,
    fontSize: 22,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
});
