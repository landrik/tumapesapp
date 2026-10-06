import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { Screen } from '../../components/common/Screen';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../theme/ThemeContext';
import { useAppSelector } from '../../store/hooks';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof ProfileStackParamList;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Edit profile', icon: 'person-outline', screen: 'EditProfile' },
  { label: 'Appearance', icon: 'color-palette-outline', screen: 'Appearance' },
  { label: 'Identity verification', icon: 'shield-checkmark-outline', screen: 'KycStatus' },
  { label: 'Notifications', icon: 'notifications-outline', screen: 'NotificationPreferences' },
  { label: 'Security', icon: 'lock-closed-outline', screen: 'Security' },
  { label: 'Linked devices', icon: 'phone-portrait-outline', screen: 'LinkedDevices' },
  { label: 'Help & support', icon: 'help-circle-outline', screen: 'HelpSupport' },
  { label: 'About', icon: 'information-circle-outline', screen: 'About' },
];

export const ProfileHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAppSelector(state => state.auth);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Profile</Text>

        <Card>
          <Text style={[styles.name, { color: theme.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {user?.country} · {user?.currency}
          </Text>
        </Card>

        <View style={styles.menu}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.menuRow, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <Ionicons name={item.icon} size={20} color={theme.textSecondary} />
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('LogoutConfirm')}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.error} />
            <Text style={[styles.menuLabel, { color: theme.error }]}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 12, marginBottom: 16 },
  name: { fontSize: 18, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 4 },
  meta: { fontSize: 13, marginTop: 8 },
  menu: { marginTop: 24 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLabel: { flex: 1, fontSize: 15 },
});
