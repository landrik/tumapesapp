import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Screen } from '../../components/common/Screen';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { BASE_URL } from '../../api/client';
import { APP_NAME, APP_VERSION } from '../../constants/appInfo';

type Props = NativeStackScreenProps<ProfileStackParamList, 'About'>;

export const AboutScreen: React.FC<Props> = () => {
  return (
    <Screen>
      <Header title="About" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.brand}>{APP_NAME}</Text>
          <Text style={styles.tagline}>A prototype money transfer app</Text>

          <View style={styles.divider} />

          <Row label="Version" value={APP_VERSION} />
          <Row label="API endpoint" value={BASE_URL} />
        </Card>

        <Text style={styles.note}>
          This is a prototype built for demonstration purposes and does not move real money.
        </Text>

        <Text style={styles.note}>
          Exchange rates provided by{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('https://www.exchangerate-api.com')}>
            ExchangeRate-API
          </Text>
          .
        </Text>
      </ScrollView>
    </Screen>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: { padding: 20 },
  brand: { fontSize: 18, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: colors.textSecondary },
  rowValue: { fontSize: 13, color: colors.text, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  note: { fontSize: 12, color: colors.textSecondary, marginTop: 16, lineHeight: 18 },
  link: { color: colors.primary, fontWeight: '600' },
});
