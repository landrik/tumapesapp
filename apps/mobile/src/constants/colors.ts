// Static default palette, kept for backward compatibility with screens
// that haven't been converted to the live theme yet (see src/theme/ThemeContext.tsx
// for the dynamic, user-selectable version — light/dark + accent color).
// Screens using `colors` directly always render the default light/green
// theme regardless of the user's actual preference; components that need
// to react to theme changes should use `useTheme()` instead.
import { DEFAULT_THEME } from './theme';

export const colors = DEFAULT_THEME;

export type ColorKey = keyof typeof colors;
