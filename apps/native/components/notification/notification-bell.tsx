import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { NotificationBellIcon } from '@/components/icons/notification-icons';
import { StyleSheet } from '@/components/ui/tamagui';

import { Badge } from '@/components/ui/badge';
import { IconButton, type IconButtonSize } from '@/components/ui/icon-button';

interface NotificationBellProps {
  accessibilityLabel?: string;
  count: number;
  onPress?: () => void;
  size?: IconButtonSize;
  style?: StyleProp<ViewStyle>;
  url?: Href;
}

const NotificationBell = ({
  accessibilityLabel,
  count,
  onPress,
  size = 'md',
  style,
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
      size={size}
      variant="ghost"
      style={style}
      onPress={handlePress}
      accessibilityLabel={
        accessibilityLabel ?? `인증 요청 알림${count > 0 ? ` ${count}건` : ''}`
      }
      icon={({ size }) => (
        <View>
          <NotificationBellIcon size={size} />
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
  badge_container: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
