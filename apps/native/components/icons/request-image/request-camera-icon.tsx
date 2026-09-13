import Svg, { Path } from 'react-native-svg';

import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

interface RequestImageIconProps {
  color?: string;
  size?: number;
}

// 피그마 droop/filled/camera
const RequestCameraIcon = ({
  color = requestFormColors.accent,
  size = baseFoundation.iconSize.l,
}: RequestImageIconProps) => (
  <Svg
    testID="request-camera-icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 10V17C22 18.6569 20.6569 20 19 20H5C3.34315 20 2 18.6569 2 17V10C2 8.34315 3.34315 7 5 7H5.73509C6.49048 7 7.16112 6.51663 7.4 5.8C7.75831 4.72506 8.76428 4 9.89737 4H14.1026C15.2357 4 16.2417 4.72506 16.6 5.8C16.8389 6.51663 17.5095 7 18.2649 7H19C20.6569 7 22 8.34315 22 10ZM12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z"
      fill={color}
    />
  </Svg>
);

export default RequestCameraIcon;
