import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { FlagIcon } from '../../components/common/FlagIcon';
import { Loader } from '../../components/common/Loader';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRecipients } from '../../store/slices/recipientSlice';
import { updateDraft } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'SelectRecipient'>;

export const SelectRecipientScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector(state => state.recipients);

  useEffect(() => {
    dispatch(fetchRecipients());
  }, [dispatch]);

  const handleSelect = (recipientId: string) => {
    dispatch(updateDraft({ recipientId }));
    navigation.navigate('EnterAmount', { recipientId });
  };

  return (
    <View style={styles.container}>
      <Header title="Select recipient" />
      {status === 'loading' && items.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item._id)}>
              <FlagIcon countryCode={item.country} size={26} />
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.sub}>
                  {item.country} · {item.currency}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No recipients yet — add one first</Text>}
        />
      )}
      <TouchableOpacity
        style={styles.addNew}
        onPress={() => navigation.navigate('AddRecipient', { returnTo: 'SelectRecipient' })}
      >
        <Text style={styles.addNewText}>+ Add a new recipient</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  addNew: { padding: 20, alignItems: 'center' },
  addNewText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
});
