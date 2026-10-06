import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';
import { Button } from '../common/Button';

interface ExchangeRateModalProps {
  visible: boolean;
  onClose: () => void;
  from: string;
  to: string;
  rate: number;
  updatedAt: string;
  isStale: boolean;
}

// Placeholder sparkline: static bars standing in for a real historical-rate
// chart. No charting library is included in this project's dependencies,
// so this avoids pulling one in just for a single decorative visual.
const SparklinePlaceholder: React.FC<{ primaryColor: string; lightColor: string }> = ({ primaryColor, lightColor }) => {
  const bars = [40, 55, 48, 62, 58, 70, 65, 78];
  return (
    <View style={styles.sparkline}>
      {bars.map((height, i) => (
        <View
          key={i}
          style={[styles.bar, { height, backgroundColor: lightColor, borderColor: primaryColor }]}
        />
      ))}
    </View>
  );
};

export const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({
  visible,
  onClose,
  from,
  to,
  rate,
  updatedAt,
  isStale,
}) => {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Exchange rate</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.rate, { color: theme.text }]}>
            1 {from} = {rate.toFixed(2)} {to}
          </Text>

          <SparklinePlaceholder primaryColor={theme.primary} lightColor={theme.primaryLight} />

          <View style={styles.statusRow}>
            <Ionicons
              name={isStale ? 'alert-circle-outline' : 'checkmark-circle-outline'}
              size={16}
              color={isStale ? theme.warning : theme.success}
            />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {isStale ? 'Rate may be out of date' : 'Live rate'} · updated{' '}
              {new Date(updatedAt).toLocaleTimeString()}
            </Text>
          </View>

          <Button label="Close" variant="outline" onPress={onClose} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONT_FAMILY.bold,
  },
  rate: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 16,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 80,
    marginBottom: 16,
  },
  bar: {
    width: 16,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 13,
  },
  button: {},
});
