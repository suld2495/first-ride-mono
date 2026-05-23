import Svg, { Path } from 'react-native-svg';

interface NotificationBellIconProps {
  color?: string;
  size?: number;
}

export const NotificationBellIcon = ({
  color = '#0E0E0E',
  size = 20,
}: NotificationBellIconProps) => (
  <Svg
    testID="notification-bell-icon"
    width={size * 0.9}
    height={size}
    viewBox="0 0 18 20"
    fill="none"
  >
    <Path
      d="M9 0C9.55229 0 10 0.447715 10 1V2.07089C13.3923 2.55612 16 5.47353 16 9V13H17C17.5523 13 18 13.4477 18 14C18 14.5523 17.5523 15 17 15H1C0.447715 15 0 14.5523 0 14C0 13.4477 0.447715 13 1 13H2V9C2 5.47353 4.60771 2.55612 8 2.07089V1C8 0.447715 8.44771 0 9 0Z"
      fill={color}
    />
    <Path
      d="M11.8356 17.9819C11.4289 19.1565 10.313 20 9 20C7.68703 20 6.57105 19.1565 6.16437 17.9819C5.98368 17.46 6.44772 17 7 17H11C11.5523 17 12.0163 17.46 11.8356 17.9819Z"
      fill={color}
    />
  </Svg>
);
