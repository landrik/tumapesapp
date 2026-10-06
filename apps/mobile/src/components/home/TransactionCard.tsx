import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FONT_FAMILY } from '../../constants/typography';
import { Transfer, TransferStatus } from '../../types/models';
import { ThemePalette } from '../../constants/theme';

interface TransactionCardProps {
  transfer: Transfer;
  onPress: () => void;
}

const getStatusMeta = (
  status: TransferStatus,
  theme: ThemePalette
): { icon: keyof typeof Ionicons.glyphMap; color: string; label: string } => {
  switch (status) {
    case 'pending':
      return { icon: 'time-outline', color: theme.statusPending, label: 'Pending' };
    case 'processing':
      return { icon: 'sync-outline', color: theme.statusProcessing, label: 'Processing' };
    case 'completed':
      return { icon: 'checkmark-circle-outline', color: theme.statusCompleted, label: 'Completed' };
    case 'failed':
      return { icon: 'close-circle-outline', color: theme.statusFailed, label: 'Failed' };
    case 'cancelled':
      return { icon: 'ban-outline', color: theme.statusCancelled, label: 'Cancelled' };
  }
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const TransactionCard: React.FC<TransactionCardProps> = ({ transfer, onPress }) => {
  const { theme } = useTheme();
  const meta = getStatusMeta(transfer.status, theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconCircle, { backgroundColor: `${meta.color}20` }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.middle}>
        <Text style={[styles.name, { color: theme.text }]}>
          {transfer.recipientSnapshot.firstName} {transfer.recipientSnapshot.lastName}
        </Text>
        <Text style={[styles.pair, { color: theme.textSecondary }]}>
          {transfer.sendCurrency} → {transfer.receiveCurrency} · {formatDate(transfer.createdAt)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: theme.text }]}>
          -{transfer.sendCurrency} {transfer.sendAmount.toFixed(2)}
        </Text>
        <Text style={[styles.badge, { color: meta.color }]}>{meta.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  middle: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
  pair: {
    fontSize: 13,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: 2,
  },
});
