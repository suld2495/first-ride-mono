import Svg, { Path } from 'react-native-svg';

import { palette } from '@/theme/tokens';

interface SearchIconProps {
  color?: string;
  testID?: string;
}

const SearchIcon = ({
  color = palette.theme.gray[10],
  testID = 'search-icon',
}: SearchIconProps) => (
  <Svg
    testID={testID}
    width={17}
    height={17}
    color={color}
    viewBox="0 0 17 17"
    fill="none"
    accessibilityElementsHidden
  >
    <Path
      testID={`${testID}-path`}
      d="M15.875 15.875L12.2916 12.2916M14.2083 7.54167C14.2083 11.2236 11.2236 14.2083 7.54167 14.2083C3.85977 14.2083 0.875 11.2236 0.875 7.54167C0.875 3.85977 3.85977 0.875 7.54167 0.875C11.2236 0.875 14.2083 3.85977 14.2083 7.54167Z"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SearchIcon;
