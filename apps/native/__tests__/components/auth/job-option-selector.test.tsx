import { fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import JobOptionSelector from '@/components/auth/job-option-selector';
import { palette } from '@/theme/tokens';

import { render } from '../../setup/test-utils';

const options = [
  {
    jobName: '마법사',
    jobType: 'MAGE',
    characterCode: 'MAGE_BEGINNER',
    imageUrl: 'https://api.irura.uk/assets/characters/mage_beginner.png',
  },
  {
    jobName: '검사',
    jobType: 'WARRIOR',
    characterCode: 'WARRIOR_BEGINNER',
    imageUrl: 'https://api.irura.uk/assets/characters/warrior_beginner.png',
  },
  {
    jobName: '궁수',
    jobType: 'ARCHER',
    characterCode: 'ARCHER_BEGINNER',
    imageUrl: 'https://api.irura.uk/assets/characters/archer_beginner.png',
  },
];

describe('JobOptionSelector', () => {
  it('기본값은 여자 전사 캐릭터 카드로 표시한다', () => {
    const onSelect = jest.fn();
    const { getByLabelText, getByTestId, getByText } = render(
      <JobOptionSelector options={options} value="" onSelect={onSelect} />,
    );

    expect(getByLabelText('여자 캐릭터 선택').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(getByText('전사')).toBeOnTheScreen();
    expect(
      getByText(
        '전사는 목표를 정하고 꾸준히 실천하는 사람에게 어울리는 캐릭터예요. 루틴을 반복해 꾸준함이 쌓일수록 더 강한 모습으로 성장해요.',
      ),
    ).toBeOnTheScreen();
    expect(
      StyleSheet.flatten(getByTestId('job-character-card').props.style),
    ).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.blue[5],
        minHeight: 430,
      }),
    );
    expect(onSelect).toHaveBeenCalledWith('검사');
  });

  it('직업을 선택하면 카드 색과 문구를 선택한 직업 테마로 바꾼다', () => {
    const onSelect = jest.fn();
    const { getByLabelText, getByTestId, getByText } = render(
      <JobOptionSelector
        options={options}
        value="마법사"
        onSelect={onSelect}
      />,
    );

    expect(getByText('마법사')).toBeOnTheScreen();
    expect(
      StyleSheet.flatten(getByTestId('job-character-card').props.style),
    ).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.red[5],
      }),
    );

    fireEvent.press(getByLabelText('궁수 선택'));
    expect(onSelect).toHaveBeenCalledWith('궁수');
  });
});
