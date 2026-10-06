import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SendMoneyStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Loader } from '../../components/common/Loader';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'Processing'>;

export const ProcessingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { transferId } = route.params;

  useEffect(() => {
    // The backend already flipped the transfer to 'processing' synchronously
    // when PinConfirmScreen called confirmTransfer — this brief pause is
    // purely a UX beat, not waiting on any further backend state change.
    const timer = setTimeout(() => {
      navigation.replace('Success', { transferId });
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation, transferId]);

  return (
    <View style={styles.container}>
      <Loader label="Processing your transfer..." />
      <Text style={styles.note}>This usually only takes a moment</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  note: { fontSize: 13, color: colors.textSecondary, marginTop: -12 },
});
