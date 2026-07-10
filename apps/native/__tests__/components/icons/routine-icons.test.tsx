import { render } from '@testing-library/react-native';
import { Path } from 'react-native-svg';

import {
  RoutineCheckmarkIcon,
  RoutineMissedIcon,
} from '@/components/icons/routine-icons';

describe('routine icons', () => {
  it('체크 아이콘의 선 두께를 2로 표시한다', () => {
    const { UNSAFE_getAllByType } = render(
      <RoutineCheckmarkIcon color="#FFFFFF" size={16} />,
    );

    expect(
      UNSAFE_getAllByType(Path).map((path) => path.props.strokeWidth),
    ).toEqual([2]);
  });

  it('X 아이콘의 모든 선 두께를 2로 표시한다', () => {
    const { UNSAFE_getAllByType } = render(
      <RoutineMissedIcon color="#18191B" />,
    );

    expect(
      UNSAFE_getAllByType(Path).map((path) => path.props.strokeWidth),
    ).toEqual([2, 2]);
  });
});
