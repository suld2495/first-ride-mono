import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, useRouter } from 'expo-router';

import { Badge } from '../common/Badge';
import { IconButton } from '../common/IconButton';

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
