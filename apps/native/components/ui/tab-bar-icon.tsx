import type { ComponentType } from 'react';

export interface TabBarIconSvgProps {
  color?: string;
  size?: number;
}

export interface TabBarIconProps {
  icon: ComponentType<TabBarIconSvgProps>;
  /** Icon size in pixels (default: 20) */
  size?: number;
  /** Color forwarded to the SVG icon */
  color?: string;
}

/**
 * TabBarIcon component for navigation tabs.
 * Forwards semantic navigation colors to SVG icons.
 *
 * @example
 * <TabBarIcon icon={HomeTabIcon} color="#0F3D68" />
 */
const TabBarIcon = ({ icon: Icon, size = 20, color }: TabBarIconProps) => {
  return <Icon size={size} color={color} />;
};

export default TabBarIcon;
