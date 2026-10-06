import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, isPassword, style, ...rest }) => {
  const { theme } = useTheme();
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={styles.container}>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: error ? theme.error : theme.border, backgroundColor: theme.surface },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={secure}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setSecure(prev => !prev)} accessibilityRole="button">
            <Ionicons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONT_FAMILY.medium,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
