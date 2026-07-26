import Svg, { Path } from 'react-native-svg';

interface JobOptionArrowIconProps {
  color: string;
  direction: 'left' | 'right';
}

const JobOptionArrowIcon = ({ color, direction }: JobOptionArrowIconProps) => {
  const testID = direction === 'left' ? 'previous-job-icon' : 'next-job-icon';

  return (
    <Svg testID={testID} width={8} height={14} viewBox="0 0 9 16" fill="none">
      <Path
        testID={`${testID}-path`}
        d={
          direction === 'left'
            ? 'M7.95999 0.960938L0.959991 7.96094L7.95999 14.9609'
            : 'M0.959991 0.960938L7.95999 7.96094L0.959991 14.9609'
        }
        stroke={color}
        strokeWidth={1.92}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default JobOptionArrowIcon;
