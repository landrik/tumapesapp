import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SendMoneyStackParamList, MainTabParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransfer, resetDraft } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'Success'>;

export const SuccessScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transferId } = route.params;
  const dispatch = useAppDispatch();
  const { current } = useAppSelector(state => state.transfers);

  useEffect(() => {
    dispatch(fetchTransfer(transferId));
  }, [dispatch, transferId]);

  const handleDone = () => {
    dispatch(resetDraft());
    const parent = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    parent?.navigate('Home');
  };

  const handleViewReceipt = () => {
    const parent = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    parent?.navigate('Activity', { screen: 'TransactionReceipt', params: { transferId } });
  };

  if (!current) {
    return <Loader label="Loading transfer..." />;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={72} color={colors.success} />
      <Text style={styles.title}>Transfer initiated</Text>
      <Text style={styles.subtitle}>
        {current.sendCurrency} {current.sendAmount.toFixed(2)} is on its way to{' '}
        {current.recipientSnapshot.firstName} {current.recipientSnapshot.lastName}
      </Text>
      <Text style={styles.reference}>Reference: {current.reference}</Text>

      <Button label="View receipt" variant="outline" onPress={handleViewReceipt} style={styles.button} />
      <Button label="Done" onPress={handleDone} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 8 },
  reference: { fontSize: 13, color: colors.textSecondary, marginBottom: 24 },
  button: { alignSelf: 'stretch', marginBottom: 12 },
});
