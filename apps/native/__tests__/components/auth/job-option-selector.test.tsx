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
    jobName: '용사',
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
  it('직업별 테마 배경색을 표시한다', () => {
    const { getByLabelText } = render(
      <JobOptionSelector options={options} value="" onSelect={jest.fn()} />,
    );

    expect(
      StyleSheet.flatten(getByLabelText('마법사 선택').props.style),
    ).toEqual(
      expect.objectContaining({ backgroundColor: palette.theme.softRed[10] }),
    );
    expect(StyleSheet.flatten(getByLabelText('용사 선택').props.style)).toEqual(
      expect.objectContaining({ backgroundColor: '#8DB9DC' }),
    );
    expect(StyleSheet.flatten(getByLabelText('궁수 선택').props.style)).toEqual(
      expect.objectContaining({ backgroundColor: palette.theme.softGreen[20] }),
    );
  });

  it('선택한 직업에 눈에 띄는 선택 표시를 보여준다', () => {
    const { getByLabelText, getByTestId } = render(
      <JobOptionSelector
        options={options}
        value="마법사"
        onSelect={jest.fn()}
      />,
    );

    expect(
      StyleSheet.flatten(getByLabelText('마법사 선택').props.style),
    ).toEqual(
      expect.objectContaining({
        borderColor: palette.theme.gray[95],
        borderWidth: 3,
      }),
    );
    expect(getByTestId('job-option-selected-check-MAGE')).toBeOnTheScreen();
  });
});
