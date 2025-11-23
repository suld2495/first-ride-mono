import { StyleSheet } from 'react-native';
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
 * import { contentColors } from '@repo/design-system';
 * const colorScheme = useColorScheme();
 * <TabBarIcon name="list" color={contentColors.body[colorScheme]} />
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
