import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';
import { Button } from '../common/Button';

interface FeeBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  sendAmount: number;
  sendCurrency: string;
  fee: number;
  rate: number;
  receiveAmount: number;
  receiveCurrency: string;
  totalDebit: number;
}

export const FeeBreakdownModal: React.FC<FeeBreakdownModalProps> = ({
  visible,
  onClose,
  sendAmount,
  sendCurrency,
  fee,
  rate,
  receiveAmount,
  receiveCurrency,
  totalDebit,
}) => {
  const { theme } = useTheme();

  const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.textSecondary }, bold && { color: theme.text, fontWeight: '700',
 fontFamily: FONT_FAMILY.bold, fontSize: 15 }]}>
        {label}
      </Text>
      <Text style={[styles.rowValue, { color: theme.text }, bold && { fontWeight: '700',
 fontFamily: FONT_FAMILY.bold, fontSize: 15 }]}>
        {value}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Fee breakdown</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Row label="You send" value={`${sendCurrency} ${sendAmount.toFixed(2)}`} />
          <Row label="Transfer fee" value={`${sendCurrency} ${fee.toFixed(2)}`} />
          <Row label="Exchange rate" value={`1 ${sendCurrency} = ${rate.toFixed(2)} ${receiveCurrency}`} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <Row label="Total to pay" value={`${sendCurrency} ${totalDebit.toFixed(2)}`} bold />
          <Row label="Recipient gets" value={`${receiveCurrency} ${receiveAmount.toFixed(2)}`} bold />

          <Button label="Got it" onPress={onClose} style={styles.button} />
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
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONT_FAMILY.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 14,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONT_FAMILY.medium,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  button: {
    marginTop: 16,
  },
});
