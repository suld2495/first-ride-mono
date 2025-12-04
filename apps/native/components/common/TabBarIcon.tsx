import { StyleSheet } from 'react-native-unistyles';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface TabBarIconProps {
  /** Icon name from FontAwesome */
  name: React.ComponentProps<typeof FontAwesome>['name'];
  /** Icon size in pixels (default: 20) */
  size?: number;
  /** Icon color - should use semantic tokens from theme */
  color: string;
}

/**
 * TabBarIcon component for navigation tabs.
 * Uses semantic tokens for consistent theming.
 *
 * @example
 * import { useUnistyles } from 'react-native-unistyles';
 * const { theme } = useUnistyles();
 * <TabBarIcon name="list" color={theme.colors.text.primary} />
 */
const TabBarIcon = ({ name, size = 20, color }: TabBarIconProps) => {
  return (
    <FontAwesome name={name} size={size} color={color} style={styles.icon} />
  );
};

const styles = StyleSheet.create({
  icon: {
    marginBottom: -3,
  },
});

export default TabBarIcon;
