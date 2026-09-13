import Svg, { Path } from 'react-native-svg';

import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

interface RequestImageIconProps {
  color?: string;
  size?: number;
}

// 피그마 다이얼로그 닫기 x (24)
const RequestDialogCloseIcon = ({
  color = requestFormColors.dialogClose,
  size = baseFoundation.iconSize.l,
}: RequestImageIconProps) => (
  <Svg
    testID="request-dialog-close-icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default RequestDialogCloseIcon;
