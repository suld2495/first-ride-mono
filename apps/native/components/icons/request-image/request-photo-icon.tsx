import Svg, { Path } from 'react-native-svg';

import { requestFormColors } from '@/theme/themes/light';
import { baseFoundation } from '@/theme/tokens';

interface RequestImageIconProps {
  color?: string;
  size?: number;
}

// 피그마 droop/filled/photo
const RequestPhotoIcon = ({
  color = requestFormColors.accent,
  size = baseFoundation.iconSize.l,
}: RequestImageIconProps) => (
  <Svg
    testID="request-photo-icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M16 8C15.4477 8 15 8.44772 15 9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9C17 8.44772 16.5523 8 16 8Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 5C2 3.89543 2.89543 3 4 3H20C21.1046 3 22 3.89543 22 5V17.5858L19.1213 14.7071C17.9497 13.5355 16.0503 13.5355 14.8787 14.7071L14.7071 14.8787C14.3166 15.2692 13.6834 15.2692 13.2929 14.8787L11.1213 12.7071C9.94975 11.5355 8.05025 11.5355 6.87868 12.7071L5.29289 14.2929C4.90237 14.6834 4.90237 15.3166 5.29289 15.7071C5.68342 16.0976 6.31658 16.0976 6.70711 15.7071L8.29289 14.1213C8.68342 13.7308 9.31658 13.7308 9.70711 14.1213L11.8787 16.2929C13.0503 17.4645 14.9497 17.4645 16.1213 16.2929L16.2929 16.1213C16.6834 15.7308 17.3166 15.7308 17.7071 16.1213L21.6766 20.0908C21.3198 20.6382 20.7021 21 20 21H4C2.89543 21 2 20.1046 2 19V5ZM13 9C13 7.34315 14.3431 6 16 6C17.6569 6 19 7.34315 19 9C19 10.6569 17.6569 12 16 12C14.3431 12 13 10.6569 13 9Z"
      fill={color}
    />
  </Svg>
);

export default RequestPhotoIcon;
