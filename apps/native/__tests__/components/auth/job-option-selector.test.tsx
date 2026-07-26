import { fireEvent } from '@testing-library/react-native';
import { Image, StyleSheet, View } from 'react-native';

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
  it('제공된 SVG를 높이 14의 직업 변경 아이콘으로 표시한다', () => {
    const screen = render(
      <JobOptionSelector options={options} value="" onSelect={jest.fn()} />,
    );

    expect(screen.getByTestId('previous-job-icon')).toHaveProp('width', 8);
    expect(screen.getByTestId('previous-job-icon')).toHaveProp('height', 14);
    expect(screen.getByTestId('next-job-icon')).toHaveProp('width', 8);
    expect(screen.getByTestId('next-job-icon')).toHaveProp('height', 14);
    expect(screen.getByTestId('previous-job-icon-path')).toHaveProp(
      'd',
      'M7.95999 0.960938L0.959991 7.96094L7.95999 14.9609',
    );
    expect(screen.getByTestId('next-job-icon-path')).toHaveProp(
      'd',
      'M0.959991 0.960938L7.95999 7.96094L0.959991 14.9609',
    );
    expect(
      StyleSheet.flatten(screen.getByTestId('previous-job-icon').props.style),
    ).not.toEqual(
      expect.objectContaining({
        transform: expect.anything(),
      }),
    );
    expect(screen.queryByText('‹')).not.toBeOnTheScreen();
    expect(screen.queryByText('›')).not.toBeOnTheScreen();
  });

  it('직업 변경 아이콘 컨테이너를 24 크기로 중앙 정렬한다', () => {
    const screen = render(
      <JobOptionSelector options={options} value="" onSelect={jest.fn()} />,
    );

    for (const label of ['이전 직업', '다음 직업']) {
      expect(
        StyleSheet.flatten(screen.getByLabelText(label).props.style),
      ).toEqual(
        expect.objectContaining({
          width: 24,
          height: 24,
          alignItems: 'center',
          justifyContent: 'center',
        }),
      );
    }
  });

  it('API 응답의 성별별 imageUrl을 큰 캐릭터와 레벨 1에 표시한다', () => {
    const femaleImageUrl =
      'https://api.irura.uk/assets/characters/warrior_female_beginner.png';
    const maleImageUrl =
      'https://api.irura.uk/assets/characters/warrior_male_beginner.png';
    const femaleOptions = options.map((option) =>
      option.jobType === 'WARRIOR'
        ? { ...option, imageUrl: femaleImageUrl }
        : option,
    );
    const maleOptions = options.map((option) =>
      option.jobType === 'WARRIOR'
        ? { ...option, imageUrl: maleImageUrl }
        : option,
    );
    const screen = render(
      <JobOptionSelector
        options={femaleOptions}
        value="검사"
        gender="FEMALE"
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen
        .UNSAFE_getAllByType(Image)
        .slice(0, 2)
        .map((image) => image.props.source),
    ).toEqual([{ uri: femaleImageUrl }, { uri: femaleImageUrl }]);

    screen.rerender(
      <JobOptionSelector
        options={maleOptions}
        value="검사"
        gender="MALE"
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen
        .UNSAFE_getAllByType(Image)
        .slice(0, 2)
        .map((image) => image.props.source),
    ).toEqual([{ uri: maleImageUrl }, { uri: maleImageUrl }]);
  });

  it('레벨 1 이미지만 기존보다 1/3 큰 72 크기로 표시한다', () => {
    const screen = render(
      <JobOptionSelector options={options} value="" onSelect={jest.fn()} />,
    );
    const [, level1Image, level2Image, level3Image] =
      screen.UNSAFE_getAllByType(Image);

    expect(StyleSheet.flatten(level1Image.props.style)).toEqual(
      expect.objectContaining({
        width: 72,
        height: 72,
      }),
    );

    for (const image of [level2Image, level3Image]) {
      expect(StyleSheet.flatten(image.props.style)).toEqual(
        expect.objectContaining({
          width: 54,
          height: 54,
        }),
      );
    }
  });

  it('성별 선택 컨테이너는 radius 8, 각 항목은 radius 4로 표시한다', () => {
    const screen = render(
      <JobOptionSelector options={options} value="" onSelect={jest.fn()} />,
    );
    const genderSegment = screen
      .UNSAFE_getAllByType(View)
      .find((view) => view.props.accessibilityRole === 'tablist');

    expect(StyleSheet.flatten(genderSegment?.props.style)).toEqual(
      expect.objectContaining({
        borderRadius: 8,
      }),
    );
    expect(
      StyleSheet.flatten(screen.getByLabelText('여자 캐릭터 선택').props.style),
    ).toEqual(
      expect.objectContaining({
        borderRadius: 4,
      }),
    );
    expect(
      StyleSheet.flatten(screen.getByLabelText('남자 캐릭터 선택').props.style),
    ).toEqual(
      expect.objectContaining({
        borderRadius: 4,
      }),
    );
  });

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
