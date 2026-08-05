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

  it.each([
    ['검사', 'warrior'],
    ['마법사', 'mage'],
    ['궁수', 'archer'],
  ] as const)(
    '선택한 직업의 여자 진화 이미지를 표시한다',
    (jobName, jobType) => {
      const screen = render(
        <JobOptionSelector
          options={options}
          value={jobName}
          gender="FEMALE"
          onSelect={jest.fn()}
        />,
      );

      expect(
        screen
          .UNSAFE_getAllByType(Image)
          .slice(0, 4)
          .map((image) => image.props.source),
      ).toEqual([
        expect.objectContaining({
          testUri: expect.stringContaining(
            `evolution/${jobType}_female_beginner.png`,
          ),
        }),
        expect.objectContaining({
          testUri: expect.stringContaining(
            `evolution/${jobType}_female_beginner.png`,
          ),
        }),
        expect.objectContaining({
          testUri: expect.stringContaining(
            `evolution/${jobType}_female_intermediate.png`,
          ),
        }),
        expect.objectContaining({
          testUri: expect.stringContaining(
            `evolution/${jobType}_female_advanced.png`,
          ),
        }),
      ]);
    },
  );

  it('성별을 남자로 바꾸면 선택한 직업의 남자 진화 이미지를 표시한다', () => {
    const screen = render(
      <JobOptionSelector
        options={options}
        value="검사"
        gender="MALE"
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen
        .UNSAFE_getAllByType(Image)
        .slice(0, 4)
        .map((image) => image.props.source),
    ).toEqual([
      expect.objectContaining({
        testUri: expect.stringContaining('evolution/warrior_male_beginner.png'),
      }),
      expect.objectContaining({
        testUri: expect.stringContaining('evolution/warrior_male_beginner.png'),
      }),
      expect.objectContaining({
        testUri: expect.stringContaining(
          'evolution/warrior_male_intermediate.png',
        ),
      }),
      expect.objectContaining({
        testUri: expect.stringContaining('evolution/warrior_male_advanced.png'),
      }),
    ]);
  });

  it('세 단계 진화 이미지를 같은 크기와 기준선으로 표시한다', () => {
    const screen = render(
      <JobOptionSelector options={options} value="" onSelect={jest.fn()} />,
    );
    const [, level1Image, level2Image, level3Image] =
      screen.UNSAFE_getAllByType(Image);

    for (const image of [level1Image, level2Image, level3Image]) {
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
