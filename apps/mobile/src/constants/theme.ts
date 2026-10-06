export type ThemeMode = 'light' | 'dark';
export type AccentName = 'green' | 'blue' | 'purple' | 'orange';

export interface ThemePalette {
  mode: ThemeMode;
  accent: AccentName;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  disabled: string;
  black: string;
  white: string;
  overlay: string;
  statusPending: string;
  statusProcessing: string;
  statusCompleted: string;
  statusFailed: string;
  statusCancelled: string;
}

const ACCENTS: Record<AccentName, { primary: string; primaryDark: string; primaryLightOnLight: string; primaryLightOnDark: string }> = {
  green: { primary: '#00A651', primaryDark: '#00803E', primaryLightOnLight: '#E6F7EE', primaryLightOnDark: '#0F3A26' },
  blue: { primary: '#2563EB', primaryDark: '#1D4ED8', primaryLightOnLight: '#EAF1FE', primaryLightOnDark: '#122A57' },
  purple: { primary: '#7C3AED', primaryDark: '#6D28D9', primaryLightOnLight: '#F1E9FE', primaryLightOnDark: '#301C4D' },
  orange: { primary: '#EA580C', primaryDark: '#C2410C', primaryLightOnLight: '#FDECE1', primaryLightOnDark: '#4A2812' },
};

export const ACCENT_OPTIONS: { name: AccentName; label: string; swatch: string }[] = [
  { name: 'green', label: 'Green', swatch: ACCENTS.green.primary },
  { name: 'blue', label: 'Blue', swatch: ACCENTS.blue.primary },
  { name: 'purple', label: 'Purple', swatch: ACCENTS.purple.primary },
  { name: 'orange', label: 'Orange', swatch: ACCENTS.orange.primary },
];

export const buildTheme = (mode: ThemeMode, accent: AccentName): ThemePalette => {
  const a = ACCENTS[accent];
  const isDark = mode === 'dark';

  return {
    mode,
    accent,
    primary: a.primary,
    primaryDark: a.primaryDark,
    primaryLight: isDark ? a.primaryLightOnDark : a.primaryLightOnLight,
    secondary: isDark ? '#E5E7EB' : '#1A1A2E',
    background: isDark ? '#0B0B0F' : '#FFFFFF',
    surface: isDark ? '#16171D' : '#F7F8FA',
    border: isDark ? '#2A2B33' : '#E5E7EB',
    text: isDark ? '#F5F5F7' : '#111827',
    textSecondary: isDark ? '#9AA0AC' : '#6B7280',
    textInverse: isDark ? '#0B0B0F' : '#FFFFFF',
    success: a.primary,
    warning: '#F59E0B',
    error: isDark ? '#F87171' : '#DC2626',
    info: isDark ? '#60A5FA' : '#2563EB',
    disabled: isDark ? '#3A3B44' : '#D1D5DB',
    black: '#000000',
    white: '#FFFFFF',
    overlay: isDark ? 'rgba(0, 0, 0, 0.65)' : 'rgba(17, 24, 39, 0.5)',
    statusPending: '#F59E0B',
    statusProcessing: isDark ? '#60A5FA' : '#2563EB',
    statusCompleted: a.primary,
    statusFailed: isDark ? '#F87171' : '#DC2626',
    statusCancelled: isDark ? '#9AA0AC' : '#6B7280',
  };
};

export const DEFAULT_THEME: ThemePalette = buildTheme('light', 'green');
