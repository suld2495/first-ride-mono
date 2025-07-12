import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useFetchReceivedRequestsQuery } from '@repo/shared/hooks/useRequest';
import { useColorSchemeStore } from '@/store/colorScheme.store';
import { useAuthStore } from '@repo/shared/store/auth.store';
import { COLORS } from '@/theme/colors';

import ThemeText from '../common/ThemeText';
import ThemeView from '../common/ThemeView';

const Header = () => {
  const colorScheme = useColorScheme();
  const { setColorScheme } = useColorSchemeStore();

  const router = useRouter();
  const { user } = useAuthStore();
  const { data: requests } = useFetchReceivedRequestsQuery(user?.name || '');

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeView style={styles.container}>
      <ThemeView>
        <ThemeText variant="title">{user?.name}</ThemeText>
      </ThemeView>

      <ThemeView style={styles.icon_container}>
        <ThemeView>
          <Pressable onPress={() => router.push('/modal?type=request-list')}>
            <ThemeView>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS[colorScheme].icon}
              />
            </ThemeView>
            {!!requests.length && (
              <ThemeView style={styles.badge_container}>
                <ThemeText
                  style={[styles.badge, { backgroundColor: COLORS.badge }]}
                >
                  {requests.length}
                </ThemeText>
              </ThemeView>
            )}
          </Pressable>
        </ThemeView>
        <ThemeView>
          <Pressable onPress={() => toggleColorScheme()}>
            {colorScheme === 'light' ? (
              <Ionicons name="moon" size={24} color={COLORS.light.icon} />
            ) : (
              <Ionicons name="sunny" size={24} color={COLORS.dark.icon} />
            )}
          </Pressable>
        </ThemeView>
      </ThemeView>
    </ThemeView>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  icon_container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  badge_container: {
    position: 'absolute',
    top: -1,
    right: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badge: {
    color: 'white',
    fontSize: 10,
  },
});
