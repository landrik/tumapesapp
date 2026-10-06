import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Loader } from '../../components/common/Loader';
import { getNotificationPrefs, updateNotificationPrefs } from '../../api/users';
import { getApiErrorMessage } from '../../api/client';
import { NotificationPrefs } from '../../types/models';

type Props = NativeStackScreenProps<ProfileStackParamList, 'NotificationPreferences'>;

const PREF_LABELS: { key: keyof NotificationPrefs; label: string; description: string }[] = [
  { key: 'transferUpdates', label: 'Transfer updates', description: 'Status changes on your transfers' },
  { key: 'rateAlerts', label: 'Rate alerts', description: 'When exchange rates move in your favour' },
  { key: 'promotions', label: 'Promotions', description: 'Offers and product news' },
  { key: 'pushEnabled', label: 'Push notifications', description: 'Master switch for device notifications' },
];

export const NotificationPreferencesScreen: React.FC<Props> = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPrefs(await getNotificationPrefs());
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    })();
  }, []);

  const handleToggle = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!prefs) return;
    const previous = prefs;
    const optimistic = { ...prefs, [key]: value };
    setPrefs(optimistic);

    try {
      const saved = await updateNotificationPrefs({ [key]: value });
      setPrefs(saved);
    } catch (err) {
      setPrefs(previous); // roll back on failure
      setError(getApiErrorMessage(err));
    }
  };

  if (!prefs) {
    return (
      <View style={styles.container}>
        <Header title="Notifications" />
        {error ? <Text style={styles.error}>{error}</Text> : <Loader />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Notifications" />
      <ScrollView contentContainerStyle={styles.content}>
        {PREF_LABELS.map(pref => (
          <View key={pref.key} style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>{pref.label}</Text>
              <Text style={styles.description}>{pref.description}</Text>
            </View>
            <Switch
              value={prefs[pref.key]}
              onValueChange={value => handleToggle(pref.key, value)}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1, paddingRight: 12 },
  label: { fontSize: 15, fontWeight: '500', color: colors.text },
  description: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  error: { color: colors.error, fontSize: 13, padding: 20 },
});
