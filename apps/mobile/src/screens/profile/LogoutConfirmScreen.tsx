import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<ProfileStackParamList, 'LogoutConfirm'>;

export const LogoutConfirmScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // RootNavigator switches back to the Auth stack automatically once
      // the token is cleared — no manual navigation needed here.
    } catch {
      // logoutThunk clears the local token even if the network call fails,
      // so the user is still signed out either way.
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Log out?</Text>
        <Text style={styles.body}>You'll need to sign in again to send money.</Text>

        <Button label="Log out" onPress={handleLogout} loading={loading} style={styles.button} />
        <Button label="Stay signed in" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: colors.background, borderRadius: 20, padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  body: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
  button: { marginBottom: 8 },
});
