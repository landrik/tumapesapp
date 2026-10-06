import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ label, fullScreen = true }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.primary} />
      {label ? <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
  },
  label: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: FONT_FAMILY.regular,
  },
});
