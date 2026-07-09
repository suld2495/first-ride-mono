import Svg, { Path } from 'react-native-svg';

interface StatsMonthChevronIconProps {
  color: string;
  direction: 'left' | 'right';
  testID: string;
}

const StatsMonthChevronIcon = ({
  color,
  direction,
  testID,
}: StatsMonthChevronIconProps) => {
  const path = direction === 'left' ? 'M10 1L6 5L10 9' : 'M6 1L10 5L6 9';

  return (
    <Svg testID={testID} width={16} height={10} viewBox="0 0 16 10" fill="none">
      <Path
        testID={`${testID}-path`}
        d={path}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default StatsMonthChevronIcon;
