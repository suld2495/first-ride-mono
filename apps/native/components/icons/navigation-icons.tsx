import Svg, { Path } from 'react-native-svg';

interface PageHeaderBackIconProps {
  color: string;
}

export const PageHeaderBackIcon = ({ color }: PageHeaderBackIconProps) => (
  <Svg
    testID="page-header-back-icon"
    width={8}
    height={14}
    viewBox="0 0 8 14"
    fill="none"
  >
    <Path
      testID="page-header-back-icon-path"
      d="M7 13L1 7L7 1"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
