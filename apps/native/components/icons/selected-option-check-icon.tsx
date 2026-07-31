import Svg, { Path } from 'react-native-svg';

interface SelectedOptionCheckIconProps {
  color: string;
  testID?: string;
}

const SelectedOptionCheckIcon = ({
  color,
  testID,
}: SelectedOptionCheckIconProps) => (
  <Svg
    testID={testID}
    color={color}
    width={16}
    height={12}
    viewBox="0 0 16 12"
    fill="none"
  >
    <Path
      d="M14.3333 1L5.16667 10.1667L1 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SelectedOptionCheckIcon;
