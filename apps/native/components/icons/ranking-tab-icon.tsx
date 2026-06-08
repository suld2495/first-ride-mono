import Svg, { Path } from 'react-native-svg';

import type { TabBarIconSvgProps } from '@/components/ui/tab-bar-icon';

export const RankingTabIcon = ({ color, size = 20 }: TabBarIconSvgProps) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M3 8C3 6.89543 3.89543 6 5 6C6.10457 6 7 6.89543 7 8V17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17V8Z"
      fill={color}
    />
    <Path
      d="M8 3C8 1.89543 8.89543 1 10 1C11.1046 1 12 1.89543 12 3V17C12 18.1046 11.1046 19 10 19C8.89543 19 8 18.1046 8 17V3Z"
      fill={color}
    />
    <Path
      d="M13 11C13 9.89543 13.8954 9 15 9C16.1046 9 17 9.89543 17 11V17C17 18.1046 16.1046 19 15 19C13.8954 19 13 18.1046 13 17V11Z"
      fill={color}
    />
  </Svg>
);
