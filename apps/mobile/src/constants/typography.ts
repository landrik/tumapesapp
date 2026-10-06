/**
 * Custom font: Inter, loaded via @expo-google-fonts/inter (see App.tsx's
 * useFonts call). Static font files like these are matched by exact family
 * NAME, not by a `fontWeight` style property the way system fonts are —
 * `{ fontFamily: 'Inter_400Regular', fontWeight: '700' }` will NOT render
 * bold on Android, and only sometimes fakes it on iOS. So instead of
 * relying on `fontWeight` alone, components should pick the matching
 * FONT_FAMILY.* constant for whatever weight they need.
 */
export const FONT_FAMILY = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export type FontWeightKey = keyof typeof FONT_FAMILY;

// Maps the numeric/keyword fontWeight values already used throughout the
// app's existing StyleSheets to the matching Inter file, so screens being
// converted can look up the right family from a weight they already wrote.
const WEIGHT_TO_FAMILY: Record<string, string> = {
  '400': FONT_FAMILY.regular,
  normal: FONT_FAMILY.regular,
  '500': FONT_FAMILY.medium,
  '600': FONT_FAMILY.semiBold,
  '700': FONT_FAMILY.bold,
  bold: FONT_FAMILY.bold,
  '800': FONT_FAMILY.extraBold,
};

export const fontFamilyForWeight = (weight: string | number = '400'): string => {
  return WEIGHT_TO_FAMILY[String(weight)] || FONT_FAMILY.regular;
};
