import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { useTheme, ThemePreference } from '../../theme/ThemeContext';
import { ACCENT_OPTIONS, AccentName } from '../../constants/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Appearance'>;

const MODE_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export const AppearanceScreen: React.FC<Props> = () => {
  const { theme, preference, accent, setPreference, setAccent } = useTheme();

  return (
    <Screen>
      <Header title="Appearance" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Theme</Text>
        <Card style={styles.card}>
          {MODE_OPTIONS.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.row,
                index < MODE_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
              onPress={() => setPreference(option.value)}
            >
              <Ionicons name={option.icon} size={20} color={theme.textSecondary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>{option.label}</Text>
              {preference === option.value ? (
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
              ) : null}
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Accent color</Text>
        <Card style={styles.card}>
          <View style={styles.swatchRow}>
            {ACCENT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.name}
                style={styles.swatchWrapper}
                onPress={() => setAccent(option.name as AccentName)}
                accessibilityLabel={option.label}
              >
                <View
                  style={[
                    styles.swatch,
                    { backgroundColor: option.swatch },
                    accent === option.name && [styles.swatchSelected, { borderColor: theme.text }],
                  ]}
                >
                  {accent === option.name ? (
                    <Ionicons name="checkmark" size={20} color={theme.white} />
                  ) : null}
                </View>
                <Text style={[styles.swatchLabel, { color: theme.textSecondary }]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          "System" follows your device's light/dark setting automatically. Your choice is saved on
          this device only.
        </Text>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  card: { padding: 0, marginBottom: 24, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  swatchRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 },
  swatchWrapper: { alignItems: 'center', gap: 8 },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderWidth: 2,
  },
  swatchLabel: { fontSize: 12, fontWeight: '500' },
  note: { fontSize: 12, lineHeight: 18, marginTop: 4 },
});
