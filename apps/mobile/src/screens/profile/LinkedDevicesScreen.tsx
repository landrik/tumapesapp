import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Device from 'expo-device';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';

type Props = NativeStackScreenProps<ProfileStackParamList, 'LinkedDevices'>;

export const LinkedDevicesScreen: React.FC<Props> = () => {
  return (
    <View style={styles.container}>
      <Header title="Linked devices" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.deviceRow}>
            <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{Device.deviceName || 'This device'}</Text>
              <Text style={styles.deviceMeta}>
                {Device.manufacturer ? `${Device.manufacturer} · ` : ''}
                {Device.modelName || 'Unknown model'}
              </Text>
              <Text style={styles.deviceMeta}>
                {Device.osName} {Device.osVersion}
              </Text>
            </View>
            <Text style={styles.currentBadge}>Current</Text>
          </View>
        </Card>

        <Text style={styles.note}>
          Only this device is shown. The backend doesn't currently track a device registry, so
          remote sessions can't be listed or revoked from here yet.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '600', color: colors.text },
  deviceMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  currentBadge: { fontSize: 12, fontWeight: '600', color: colors.success },
  note: { fontSize: 12, color: colors.textSecondary, marginTop: 16, lineHeight: 18 },
});
