import corridors from './rates';

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  currency: string;
  callingCode: string; // international dialing code, no leading '+'
}

// The country -> currency/calling-code mapping for every currency the app
// can actually receive money in (i.e. every corridor's `to` currency in
// rates.ts). This is the single source of truth for "which countries are
// served" — derived from corridors rather than duplicated, so the two
// can't drift.
const CURRENCY_TO_COUNTRY: Record<string, Omit<Country, 'currency'>> = {
  KES: { code: 'KE', name: 'Kenya', callingCode: '254' },
  NGN: { code: 'NG', name: 'Nigeria', callingCode: '234' },
  GHS: { code: 'GH', name: 'Ghana', callingCode: '233' },
  ZAR: { code: 'ZA', name: 'South Africa', callingCode: '27' },
  UGX: { code: 'UG', name: 'Uganda', callingCode: '256' },
  TZS: { code: 'TZ', name: 'Tanzania', callingCode: '255' },
  PHP: { code: 'PH', name: 'Philippines', callingCode: '63' },
  INR: { code: 'IN', name: 'India', callingCode: '91' },
  PKR: { code: 'PK', name: 'Pakistan', callingCode: '92' },
  BDT: { code: 'BD', name: 'Bangladesh', callingCode: '880' },
};

const receiveCurrencies = Array.from(new Set(corridors.map(c => c.to)));

export const SUPPORTED_COUNTRIES: Country[] = receiveCurrencies
  .filter(currency => CURRENCY_TO_COUNTRY[currency])
  .map(currency => ({ ...CURRENCY_TO_COUNTRY[currency], currency }));

export const getCurrencyForCountry = (countryCode: string): string | null => {
  const match = SUPPORTED_COUNTRIES.find(
    c => c.code.toUpperCase() === countryCode.toUpperCase()
  );
  return match ? match.currency : null;
};

export const isSupportedCountry = (countryCode: string): boolean => {
  return getCurrencyForCountry(countryCode) !== null;
};

export default SUPPORTED_COUNTRIES;
