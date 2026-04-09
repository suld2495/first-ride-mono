import Ionicons from '@expo/vector-icons/Ionicons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

import { Badge } from '@/components/ui/badge';
import { IconButton } from '@/components/ui/icon-button';

interface NotificationBellProps {
  count: number;
  onPress?: () => void;
  url?: Href;
}

const NotificationBell = ({ count, onPress, url }: NotificationBellProps) => {
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
      accessibilityLabel={`인증 요청 알림${count > 0 ? ` ${count}건` : ''}`}
      icon={({ color }) => (
        <View>
          <Ionicons name="notifications-outline" size={24} color={color} />
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
