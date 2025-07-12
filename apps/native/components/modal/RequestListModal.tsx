import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { useRequestStore } from '@repo/shared/store/request.store';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';
import { getFormatDate } from '@/utils/date-utils';

import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

const RequestListModal = () => {
  const colorScheme = useColorScheme();
  const styles = createStyles(colorScheme);

  const router = useRouter();
  const { user } = useAuthStore();
  const { data: requests } = useFetchReceivedRequestsQuery(user?.name || '');
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
            <Pressable onPress={() => handleMove(item.id)}>
              <View key={item.id} style={styles.itemContainer}>
                <ThemeText variant="button" style={styles.itemText}>
                  {item.routineName}
                </ThemeText>
                <View style={styles.itemInfo}>
                  <ThemeText variant="caption">{item.nickname}</ThemeText>
                  <ThemeText variant="caption">
                    {getFormatDate(new Date(item.createdAt))}
                  </ThemeText>
                </View>
              </View>
            </Pressable>
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <ThemeView style={styles.empty}>
          <ThemeText>요청이 없습니다.</ThemeText>
        </ThemeView>
      )}
    </ThemeView>
  );
};

export default RequestListModal;

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS[colorScheme].grey,
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
