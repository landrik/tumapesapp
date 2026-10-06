import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

interface ScreenProps extends ViewProps {
  /** Which edges to apply safe-area insets to. Defaults to top only, since
   * most screens put a ScrollView/FlatList below and handle their own
   * bottom padding (tab bar, buttons) themselves. */
  edges?: Edge[];
  padded?: boolean;
}

/**
 * Standard screen container. Fixes the class of bug where content (titles,
 * headers) renders underneath the iPhone notch/Dynamic Island/status bar:
 * previously several screens used a hardcoded `paddingTop: 60` guess, which
 * doesn't match every device (Dynamic Island devices need more, older
 * devices with no notch need much less, Android status bar height differs
 * again). SafeAreaView reads the actual inset for the current device.
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  edges = ['top'],
  padded = false,
  ...rest
}) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.base, { backgroundColor: theme.background }, padded && styles.padded, style]}
      {...rest}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
  },
});
