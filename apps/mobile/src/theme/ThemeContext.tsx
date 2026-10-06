import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AccentName, ThemeMode, ThemePalette, buildTheme, DEFAULT_THEME } from '../constants/theme';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemePalette;
  preference: ThemePreference;
  accent: AccentName;
  setPreference: (preference: ThemePreference) => void;
  setAccent: (accent: AccentName) => void;
}

const PREFERENCE_KEY = 'tumapesa_theme_preference';
const ACCENT_KEY = 'tumapesa_theme_accent';

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  preference: 'system',
  accent: 'green',
  setPreference: () => undefined,
  setAccent: () => undefined,
});

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

const isAccentName = (value: string | null): value is AccentName =>
  value === 'green' || value === 'blue' || value === 'purple' || value === 'orange';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [accent, setAccentState] = useState<AccentName>('green');

  useEffect(() => {
    (async () => {
      const [storedPreference, storedAccent] = await Promise.all([
        SecureStore.getItemAsync(PREFERENCE_KEY),
        SecureStore.getItemAsync(ACCENT_KEY),
      ]);
      if (isThemePreference(storedPreference)) setPreferenceState(storedPreference);
      if (isAccentName(storedAccent)) setAccentState(storedAccent);
    })();
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    SecureStore.setItemAsync(PREFERENCE_KEY, next).catch(() => undefined);
  };

  const setAccent = (next: AccentName) => {
    setAccentState(next);
    SecureStore.setItemAsync(ACCENT_KEY, next).catch(() => undefined);
  };

  const resolvedMode: ThemeMode = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => buildTheme(resolvedMode, accent), [resolvedMode, accent]);

  const value = useMemo(
    () => ({ theme, preference, accent, setPreference, setAccent }),
    [theme, preference, accent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
