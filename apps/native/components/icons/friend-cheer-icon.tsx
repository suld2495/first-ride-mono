import Svg, { Path } from 'react-native-svg';

import { baseFoundation, palette } from '@/theme/tokens';

const FriendCheerIcon = () => (
  <Svg
    testID="friend-cheer-icon"
    width={baseFoundation.iconSize.xs}
    height={baseFoundation.dimension.x13}
    viewBox="0 0 12 13"
    fill="none"
  >
    <Path
      d="M11.7412 5.61889L10.8524 10.9522C10.7452 11.5951 10.1889 12.0664 9.53716 12.0664H5.33333C4.59695 12.0664 4 11.4694 4 10.733V4.73303C4.06098 4.61309 4.12195 4.50357 4.18497 4.39039C4.46644 3.88484 4.78862 3.30618 5.33333 1.39969C6 -0.933644 8 0.0663568 8 1.39969V4.06635H10.4261C11.25 4.06635 11.8767 4.80618 11.7412 5.61889Z"
      fill={palette.theme.blue[50]}
    />
    <Path
      d="M0 10.733V6.06636C0 5.32998 0.596954 4.73302 1.33333 4.73302C2.06971 4.73302 2.66667 5.32998 2.66667 6.06636V10.733C2.66667 11.4694 2.06971 12.0664 1.33333 12.0664C0.596954 12.0664 0 11.4694 0 10.733Z"
      fill={palette.theme.blue[50]}
    />
  </Svg>
);

export default FriendCheerIcon;
