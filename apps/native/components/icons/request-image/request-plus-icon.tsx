import Svg, { Path } from 'react-native-svg';

import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

interface RequestImageIconProps {
  color?: string;
  size?: number;
}

// 피그마 plus (32)
const RequestPlusIcon = ({
  color = requestFormColors.label,
  size = baseFoundation.iconSize.xl,
}: RequestImageIconProps) => (
  <Svg
    testID="request-plus-icon"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
  >
    <Path
      d="M16 6.66669V25.3334"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.66669 16H25.3334"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default RequestPlusIcon;
