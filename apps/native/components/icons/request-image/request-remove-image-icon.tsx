import Svg, { Path } from 'react-native-svg';

import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

interface RequestImageIconProps {
  color?: string;
  size?: number;
}

// 피그마 button_delete 내부 x (12)
const RequestRemoveImageIcon = ({
  color = requestFormColors.removeIcon,
  size = baseFoundation.iconSize.xs,
}: RequestImageIconProps) => (
  <Svg
    testID="request-remove-image-icon"
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
  >
    <Path
      d="M1.9998 1.99988L9.9998 9.99988M1.9998 9.99988L9.9998 1.99988"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default RequestRemoveImageIcon;
