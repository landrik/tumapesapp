import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  ...rest
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: theme.primary }
      : variant === 'outline'
      ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.primary }
      : { backgroundColor: 'transparent' };

  const labelColor = variant === 'primary' ? theme.white : theme.primary;

  return (
    <TouchableOpacity
      style={[styles.base, variantStyle, isDisabled && styles.disabled, style]}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
});
