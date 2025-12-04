import { FlatList } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { useRequestStore } from '@repo/shared/store/request.store';
import { getFormatDate } from '@repo/shared/utils';
import { useRouter } from 'expo-router';

import { Button } from '../common/Button';
import { Divider } from '../common/Divider';
import ThemeView from '../common/ThemeView';
import { Typography } from '../common/Typography';

const RequestListModal = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: requests } = useFetchReceivedRequestsQuery(
    user?.nickname || '',
  );
  const setRequestId = useRequestStore((state) => state.setRequestId);

  const handleMove = (requestId: number) => {
    router.push('/modal?type=request-detail');
    setRequestId(requestId);
  };

  return (
    <ThemeView style={styles.container}>
      {requests.length ? (
        <FlatList
          data={requests}
          keyExtractor={({ id }) => id.toString()}
          renderItem={({ item }) => (
            <Button
              variant="ghost"
              onPress={() => handleMove(item.id)}
              style={{ padding: 0 }}
            >
              <ThemeView key={item.id} style={styles.itemContainer} transparent>
                <Typography variant="label" style={styles.itemText}>
                  {item.routineName}
                </Typography>
                <ThemeView style={styles.itemInfo} transparent>
                  <Typography variant="caption">{item.nickname}</Typography>
                  <Typography variant="caption">
                    {getFormatDate(new Date(item.createdAt))}
                  </Typography>
                </ThemeView>
              </ThemeView>
            </Button>
          )}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.list}
        />
      ) : (
        <ThemeView style={styles.empty} transparent>
          <Typography>요청이 없습니다.</Typography>
        </ThemeView>
      )}
    </ThemeView>
  );
};

export default RequestListModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  list: {
    gap: 10,
    padding: 10,
    flexGrow: 0,
  },

  itemContainer: {
    paddingBottom: 12,
  },

  itemText: {
    fontWeight: 'semibold',
  },

  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  empty: {
    marginTop: 30,
    alignItems: 'center',
  },
});
