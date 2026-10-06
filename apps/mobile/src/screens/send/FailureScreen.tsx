import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SendMoneyStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<SendMoneyStackParamList, 'Failure'>;

export const FailureScreen: React.FC<Props> = ({ navigation, route }) => {
  const { message } = route.params;

  return (
    <View style={styles.container}>
      <Ionicons name="close-circle" size={72} color={colors.error} />
      <Text style={styles.title}>Transfer failed</Text>
      <Text style={styles.subtitle}>{message}</Text>

      <Button
        label="Try again"
        onPress={() => navigation.navigate('SendHome')}
        style={styles.button}
      />
      <Button label="Contact support" variant="ghost" onPress={() => undefined} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  button: { alignSelf: 'stretch', marginBottom: 12 },
});
