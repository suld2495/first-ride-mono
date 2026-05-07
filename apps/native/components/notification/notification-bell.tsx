import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { Image, View } from 'react-native';
import { StyleSheet } from '@/components/ui/tamagui';
import { baseFoundation } from '@/theme/tokens';

import { Badge } from '@/components/ui/badge';
import { IconButton } from '@/components/ui/icon-button';

interface NotificationBellProps {
  accessibilityLabel?: string;
  count: number;
  onPress?: () => void;
  url?: Href;
}

const NotificationBell = ({
  accessibilityLabel,
  count,
  onPress,
  url,
}: NotificationBellProps) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (url) {
      router.push(url);
    }
  };

  return (
    <IconButton
      variant="ghost"
      onPress={handlePress}
      accessibilityLabel={
        accessibilityLabel ?? `인증 요청 알림${count > 0 ? ` ${count}건` : ''}`
      }
      icon={() => (
        <View>
          <Image
            source={require('@/assets/notification/union-bell.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          {count > 0 && (
            <View style={styles.badge_container}>
              <Badge count={count} variant="error" size="sm" />
            </View>
          )}
        </View>
      )}
    />
  );
};

export default NotificationBell;

const styles = StyleSheet.create({
  icon: {
    width: baseFoundation.dimension.x18,
    height: baseFoundation.dimension.x18,
  },
  badge_container: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
