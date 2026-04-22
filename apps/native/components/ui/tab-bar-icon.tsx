import { Image, type ImageSourcePropType } from 'react-native';
import { StyleSheet } from '@/lib/unistyles';

export interface TabBarIconProps {
  source: ImageSourcePropType;
  /** Icon size in pixels (default: 20) */
  size?: number;
  /** Tint color for the icon */
  color?: string;
}

/**
 * TabBarIcon component for navigation tabs.
 * Uses semantic tokens for consistent theming.
 *
 * @example
 * import { useUnistyles } from '@/lib/unistyles';
 * <TabBarIcon source={require('@/assets/tab-bar/home.png')} color="#0F3D68" />
 */
const TabBarIcon = ({ source, size = 20, color }: TabBarIconProps) => {
  return (
    <Image
      source={source}
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          tintColor: color,
        },
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  icon: {
    // marginBottom removed to fix inconsistent icon alignment
  },
});

export default TabBarIcon;
