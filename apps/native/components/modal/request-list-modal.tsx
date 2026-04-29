import { getFormatDate } from '@repo/shared/utils';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { baseFoundation } from '@/theme/tokens';

import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { FlashList } from '@/components/ui/flash-list';
import ThemeView from '@/components/ui/theme-view';
import { Typography } from '@/components/ui/typography';
import { useAuthUser } from '@/hooks/useAuthSession';
import { useReceivedRequests } from '@/hooks/useReceivedRequests';
import { useSetRequestId } from '@/hooks/useRequestSelection';
import { StyleSheet } from '@/components/ui/tamagui';

interface RequestListItem {
  id: number;
  routineName: string;
  nickname: string;
  createdAt: string;
}

interface RequestRenderItemProps {
  item: RequestListItem;
}

const REQUEST_ITEM_HEIGHT = 69;

const getRequestItemLayout = (_: RequestListItem[] | null, index: number) => ({
  length: REQUEST_ITEM_HEIGHT,
  offset: REQUEST_ITEM_HEIGHT * index,
  index,
});

const RequestListModal = () => {
  const router = useRouter();
  const user = useAuthUser();
  const { data: requests } = useReceivedRequests(user?.nickname || '');
  const setRequestId = useSetRequestId();

  const handleMove = useCallback(
    (requestId: number) => {
      router.push('/modal?type=request-detail');
      setRequestId(requestId);
    },
    [router, setRequestId],
  );

  const renderRequestItem = useCallback(
    ({ item }: RequestRenderItemProps) => (
      <Button
        variant="ghost"
        onPress={() => handleMove(item.id)}
        style={{ padding: baseFoundation.spacing.none }}
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
    ),
    [handleMove],
  );

  return (
    <ThemeView style={styles.container}>
      {requests.length ? (
        <FlashList
          data={requests}
          keyExtractor={({ id }) => id.toString()}
          renderItem={renderRequestItem}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.list}
          estimatedItemSize={72}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          getItemLayout={getRequestItemLayout}
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
    gap: baseFoundation.dimension.x10,
    padding: baseFoundation.dimension.x10,
    flexGrow: 0,
  },

  itemContainer: {
    paddingBottom: baseFoundation.dimension.x12,
  },

  itemText: {
    fontWeight: 'semibold',
  },

  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: baseFoundation.dimension.x12,
  },

  empty: {
    marginTop: baseFoundation.dimension.x30,
    alignItems: 'center',
  },
});
