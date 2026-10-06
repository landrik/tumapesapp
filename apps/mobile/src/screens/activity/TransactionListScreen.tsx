import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityStackParamList } from '../../types/navigation';
import { colors } from '../../constants/colors';
import { Screen } from '../../components/common/Screen';
import { TransactionCard } from '../../components/home/TransactionCard';
import { Loader } from '../../components/common/Loader';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransfers } from '../../store/slices/transferSlice';

type Props = NativeStackScreenProps<ActivityStackParamList, 'TransactionList'>;

export const TransactionListScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { list, status, listTotal } = useAppSelector(state => state.transfers);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTransfers({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await dispatch(fetchTransfers({ page: 1, limit: 20 }));
    setRefreshing(false);
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (list.length >= listTotal) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(fetchTransfers({ page: nextPage, limit: 20 }));
  }, [dispatch, list.length, listTotal, page]);

  return (
    <Screen>
      <Text style={styles.title}>Activity</Text>
      {status === 'loading' && list.length === 0 ? (
        <Loader />
      ) : (
        <FlatList
          data={list}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          onEndReachedThreshold={0.4}
          onEndReached={handleLoadMore}
          renderItem={({ item }) => (
            <TransactionCard
              transfer={item}
              onPress={() => navigation.navigate('TransactionDetail', { transferId: item._id })}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>No transfers yet</Text>}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginTop: 12, marginBottom: 12 },
  list: { paddingHorizontal: 20 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
});
