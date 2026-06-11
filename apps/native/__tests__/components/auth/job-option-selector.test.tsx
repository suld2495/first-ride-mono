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
  it('직업 옵션을 캐릭터 카드로 표시한다', () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <JobOptionSelector options={options} value="" onSelect={jest.fn()} />,
    );

    expect(
      StyleSheet.flatten(getByTestId('job-option-row').props.style),
    ).toEqual(
      expect.objectContaining({
        paddingHorizontal: 18,
      }),
    );
    expect(
      StyleSheet.flatten(getByLabelText('마법사 선택').props.style),
    ).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.blue[5],
        borderRadius: 12,
        flex: 1,
        height: 138,
      }),
    );
    expect(StyleSheet.flatten(getByLabelText('전사 선택').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.blue[5],
        flex: 1,
      }),
    );
    expect(StyleSheet.flatten(getByLabelText('궁수 선택').props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.blue[5],
        flex: 1,
      }),
    );
    expect(getByText('마법사').props.fontSize).toBe('$body2');
    expect(getByText('마법사').props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(getByText('마법사').props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[100],
        marginTop: 12,
      }),
    );
  });

  it('선택한 직업을 보더로 강조한다', () => {
    const { getByLabelText, getByTestId } = render(
      <JobOptionSelector options={options} value="검사" onSelect={jest.fn()} />,
    );

    expect(
      StyleSheet.flatten(getByTestId('job-option-row').props.style),
    ).toEqual(
      expect.objectContaining({
        width: '102.5%',
      }),
    );

    expect(
      StyleSheet.flatten(getByLabelText('마법사 선택').props.style),
    ).toEqual(
      expect.objectContaining({
        flex: 100,
        height: 138,
      }),
    );
    expect(
      StyleSheet.flatten(getByLabelText('마법사 선택').props.style).width,
    ).toBeUndefined();
    expect(StyleSheet.flatten(getByLabelText('전사 선택').props.style)).toEqual(
      expect.objectContaining({
        borderColor: palette.theme.blue[50],
        borderWidth: 3,
        flex: 148,
        height: 205,
      }),
    );
    expect(
      StyleSheet.flatten(getByLabelText('전사 선택').props.style).width,
    ).toBeUndefined();
  });
});
