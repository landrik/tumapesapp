import React from 'react';
import { Text, TextStyle } from 'react-native';

/**
 * Converts an ISO 3166-1 alpha-2 country code (e.g. 'NG', 'GB') into its
 * flag emoji by mapping each letter to a Regional Indicator Symbol.
 */
export const countryCodeToFlagEmoji = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🏳️';

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};

interface FlagIconProps {
  countryCode: string;
  size?: number;
  style?: TextStyle;
}

// No theme dependency here — flag emoji rendering is handled by the OS,
// not by app colors, so there's nothing to theme.
export const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, size = 20, style }) => {
  return <Text style={[{ fontSize: size }, style]}>{countryCodeToFlagEmoji(countryCode)}</Text>;
};
