import React, { useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';

const PIN_LENGTH = 6;
const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];

interface PinEntryModalProps {
  visible: boolean;
  onClose: () => void;
  /** Return true if the PIN is correct. Can be async (e.g. checking SecureStore). */
  onSubmit: (pin: string) => Promise<boolean> | boolean;
  onSuccess: () => void;
  title?: string;
}

export const PinEntryModal: React.FC<PinEntryModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onSuccess,
  title = 'Enter your PIN',
}) => {
  const { theme } = useTheme();
  const [pin, setPin] = useState('');
  const [checking, setChecking] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = async (key: string) => {
    if (checking) return;

    if (key === 'backspace') {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    if (key === '') return;

    const nextPin = pin + key;
    setPin(nextPin);

    if (nextPin.length === PIN_LENGTH) {
      setChecking(true);
      const isCorrect = await onSubmit(nextPin);
      setChecking(false);

      if (isCorrect) {
        setPin('');
        onSuccess();
      } else {
        triggerShake();
        setTimeout(() => setPin(''), 200);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.background }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button">
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>

          <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { borderColor: theme.primary },
                  i < pin.length && { backgroundColor: theme.primary },
                ]}
              />
            ))}
          </Animated.View>

          <View style={styles.keypad}>
            {KEYPAD_KEYS.map((key, i) => (
              <TouchableOpacity
                key={i}
                style={styles.key}
                disabled={key === ''}
                onPress={() => handleKeyPress(key)}
                accessibilityRole="button"
              >
                {key === 'backspace' ? (
                  <Ionicons name="backspace-outline" size={22} color={theme.text} />
                ) : (
                  <Text style={[styles.keyLabel, { color: theme.text }]}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DOT_SIZE = 14;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.5,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: FONT_FAMILY.medium,
  },
});
