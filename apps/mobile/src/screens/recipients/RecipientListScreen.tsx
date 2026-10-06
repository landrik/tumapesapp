import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecipientsStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Screen } from '../../components/common/Screen';
import { FlagIcon } from '../../components/common/FlagIcon';
import { Loader } from '../../components/common/Loader';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRecipients, removeRecipient } from '../../store/slices/recipientSlice';
import { getDeliveryMethodLabel } from '../../constants/deliveryMethods';
import { Recipient } from '../../types/models';

type Props = NativeStackScreenProps<RecipientsStackParamList, 'RecipientList'>;

export const RecipientListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector(state => state.recipients);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchRecipients());
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchRecipients());
    setRefreshing(false);
  }, [dispatch]);

  const handleDelete = (recipient: Recipient) => {
    Alert.alert(
      'Delete recipient?',
      `${recipient.firstName} ${recipient.lastName} will be removed from your saved recipients.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeRecipient(recipient._id)).unwrap();
            } catch (err) {
              Alert.alert('Could not delete', typeof err === 'string' ? err : 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (recipient: Recipient) => (
    <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(recipient)}>
      <Ionicons name="trash-outline" size={22} color={colors.white} />
      <Text style={styles.deleteLabel}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <Text style={styles.title}>Recipients</Text>
      {status === 'loading' && items.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(item)}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => navigation.navigate('RecipientDetail', { recipientId: item._id })}
              >
                <FlagIcon countryCode={item.country} size={26} />
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {item.nickname || `${item.firstName} ${item.lastName}`}
                  </Text>
                  <Text style={styles.sub}>
                    {item.currency} · {getDeliveryMethodLabel(item.deliveryMethod)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </Swipeable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No recipients yet</Text>}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginTop: 12, marginBottom: 12 },
  list: { paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    backgroundColor: colors.background,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 88,
  },
  deleteLabel: { color: colors.white, fontSize: 12, fontWeight: '600', marginTop: 4 },
});
