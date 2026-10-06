import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors } from '../../constants/colors';
import { Screen } from '../../components/common/Screen';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransfers } from '../../store/slices/transferSlice';
import { QuickSendWidget } from '../../components/home/QuickSendWidget';
import { TransactionCard } from '../../components/home/TransactionCard';
import { Loader } from '../../components/common/Loader';
import { MainTabParamList } from '../../types/navigation';

type Nav = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { list, status } = useAppSelector(state => state.transfers);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransfers = useCallback(() => {
    dispatch(fetchTransfers({ page: 1, limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTransfers({ page: 1, limit: 5 }));
    setRefreshing(false);
  };

  return (
    <Screen>
      <FlatList
        data={list}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <>
            <Text style={styles.greeting}>Hi {user?.firstName || 'there'} 👋</Text>
            <QuickSendWidget onPress={() => navigation.navigate('Send', { screen: 'SendHome' })} />
            <Text style={styles.sectionTitle}>Recent activity</Text>
            {status === 'loading' && list.length === 0 ? <Loader fullScreen={false} /> : null}
          </>
        }
        renderItem={({ item }) => (
          <TransactionCard
            transfer={item}
            onPress={() =>
              navigation.navigate('Activity', {
                screen: 'TransactionDetail',
                params: { transferId: item._id },
              })
            }
          />
        )}
        ListEmptyComponent={
          status !== 'loading' ? <Text style={styles.empty}>No transfers yet</Text> : null
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: { padding: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 24, marginBottom: 8 },
  empty: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 20 },
});
