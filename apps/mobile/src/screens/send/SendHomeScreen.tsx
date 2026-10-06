import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Screen } from '../../components/common/Screen';
import { Button } from '../../components/common/Button';
import { FlagIcon } from '../../components/common/FlagIcon';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchRecipients } from '../../store/slices/recipientSlice';
import { updateDraft } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'SendHome'>;

export const SendHomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(state => state.recipients);

  useEffect(() => {
    dispatch(fetchRecipients());
  }, [dispatch]);

  const handleSelectRecipient = (recipientId: string) => {
    dispatch(updateDraft({ recipientId }));
    navigation.navigate('EnterAmount', { recipientId });
  };

  return (
    <Screen padded>
      <Text style={styles.title}>Send money</Text>

      <Button label="Choose a recipient" onPress={() => navigation.navigate('SelectRecipient')} style={styles.button} />
      <Button
        label="Add a new recipient"
        variant="outline"
        onPress={() => navigation.navigate('AddRecipient', { returnTo: 'SendHome' })}
        style={styles.button}
      />

      {items.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Send again to</Text>
          <FlatList
            data={items.slice(0, 5)}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recipientRow} onPress={() => handleSelectRecipient(item._id)}>
                <FlagIcon countryCode={item.country} size={24} />
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>
                    {item.nickname || `${item.firstName} ${item.lastName}`}
                  </Text>
                  <Text style={styles.recipientCountry}>{item.country}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 20 },
  button: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  recipientRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 15, fontWeight: '600', color: colors.text },
  recipientCountry: { fontSize: 12, color: colors.textSecondary },
});
