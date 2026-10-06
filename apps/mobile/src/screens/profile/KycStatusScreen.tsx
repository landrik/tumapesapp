import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { getKycStatus } from '../../api/kyc';
import { getApiErrorMessage } from '../../api/client';
import { KycStatus, KycStatusResponse } from '../../types/models';

type Props = NativeStackScreenProps<ProfileStackParamList, 'KycStatus'>;

const STATUS_META: Record<KycStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; title: string }> = {
  unverified: { icon: 'alert-circle-outline', color: colors.warning, title: 'Not verified yet' },
  pending: { icon: 'time-outline', color: colors.statusProcessing, title: 'Under review' },
  verified: { icon: 'checkmark-circle', color: colors.success, title: 'Verified' },
  rejected: { icon: 'close-circle', color: colors.error, title: 'Verification failed' },
};

export const KycStatusScreen: React.FC<Props> = ({ navigation }) => {
  const [status, setStatus] = useState<KycStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setStatus(await getKycStatus());
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when returning from the submit flow, so a newly-submitted
  // document immediately shows as 'pending'.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!status) {
    return (
      <View style={styles.container}>
        <Header title="Identity verification" />
        {error ? <Text style={styles.error}>{error}</Text> : <Loader />}
      </View>
    );
  }

  const meta = STATUS_META[status.status];
  const canSubmit = status.status === 'unverified' || status.status === 'rejected';

  return (
    <View style={styles.container}>
      <Header title="Identity verification" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.statusRow}>
            <Ionicons name={meta.icon} size={32} color={meta.color} />
            <Text style={styles.statusTitle}>{meta.title}</Text>
          </View>

          {status.status === 'pending' ? (
            <>
              <Text style={styles.detail}>
                Submitted {status.submittedAt ? new Date(status.submittedAt).toLocaleString() : ''}
              </Text>
              <Text style={styles.detail}>Estimated review: {status.estimatedReview}</Text>
            </>
          ) : null}

          {status.status === 'verified' && status.verifiedAt ? (
            <Text style={styles.detail}>Verified on {new Date(status.verifiedAt).toLocaleDateString()}</Text>
          ) : null}

          {status.status === 'rejected' ? (
            <Text style={styles.detail}>{status.reason}</Text>
          ) : null}

          {status.status === 'unverified' ? (
            <Text style={styles.detail}>
              You'll need to verify your identity before sending money.
            </Text>
          ) : null}
        </Card>

        {canSubmit ? (
          <Button
            label={status.status === 'rejected' ? 'Resubmit documents' : 'Verify my identity'}
            onPress={() => navigation.navigate('KycSubmit')}
            style={styles.button}
          />
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  statusTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  detail: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  error: { color: colors.error, fontSize: 13, padding: 20 },
  button: { marginTop: 20 },
});
