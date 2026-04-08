import QuestInfo from '../../../components/quest/quest-info';
import { render } from '../../setup/test-utils';

describe('QuestInfo', () => {
  it.each([
    {
      verificationType: 'WEEKLY_APP_VISIT' as const,
      title: '앱 방문 진행률',
      currentLabel: '방문 횟수',
      description: '이번 주 앱 방문 횟수를 기준으로 달성 여부를 확인해요.',
      currentVerificationCount: 2,
      verificationTargetCount: 7,
      progressLabel: '29%',
      countLabel: '2회 / 7회',
    },
    {
      verificationType: 'WEEKLY_MATE_ROUTINE_REVIEW' as const,
      title: '메이트 리뷰 진행률',
      currentLabel: '리뷰 처리 횟수',
      description:
        '메이트 루틴 인증 요청을 처리한 횟수를 기준으로 달성 여부를 확인해요.',
      currentVerificationCount: 1,
      verificationTargetCount: 3,
      progressLabel: '33%',
      countLabel: '1회 / 3회',
    },
    {
      verificationType: 'WEEKLY_SELF_ROUTINE_PASS' as const,
      title: '내 루틴 인증 진행률',
      currentLabel: '인증 성공 횟수',
      description:
        '내 루틴 인증이 승인된 횟수를 기준으로 달성 여부를 확인해요.',
      currentVerificationCount: 4,
      verificationTargetCount: 5,
      progressLabel: '80%',
      countLabel: '4회 / 5회',
    },
  ])(
    '$verificationType 에 맞는 퀘스트 진행 정보를 표시한다',
    ({
      verificationType,
      title,
      description,
      currentVerificationCount,
      verificationTargetCount,
      progressLabel,
      countLabel,
    }) => {
      const { getByText } = render(
        <QuestInfo
          verificationType={verificationType}
          currentVerificationCount={currentVerificationCount}
          verificationTargetCount={verificationTargetCount}
        />,
      );

      expect(getByText(title)).toBeOnTheScreen();
      expect(getByText(description)).toBeOnTheScreen();
      expect(getByText(progressLabel)).toBeOnTheScreen();
      expect(getByText(countLabel)).toBeOnTheScreen();
    },
  );

  it('verificationType 이 없더라도 기본 진행 정보로 안전하게 렌더된다', () => {
    const { getByText } = render(
      <QuestInfo
        verificationType={undefined as never}
        currentVerificationCount={2}
        verificationTargetCount={7}
      />,
    );

    expect(getByText('퀘스트 진행률')).toBeOnTheScreen();
    expect(
      getByText('현재 누적된 진행 횟수를 기준으로 달성 여부를 확인해요.'),
    ).toBeOnTheScreen();
    expect(getByText('29%')).toBeOnTheScreen();
    expect(getByText('2회 / 7회')).toBeOnTheScreen();
  });

  it('레벨과 인원 관련 정보는 표시하지 않는다', () => {
    const { queryByText } = render(
      <QuestInfo
        verificationType="WEEKLY_APP_VISIT"
        currentVerificationCount={2}
        verificationTargetCount={7}
      />,
    );

    expect(queryByText('최소 레벨')).not.toBeOnTheScreen();
    expect(queryByText('현재 인원')).not.toBeOnTheScreen();
    expect(queryByText('최대 인원')).not.toBeOnTheScreen();
    expect(queryByText('파티현황')).not.toBeOnTheScreen();
    expect(queryByText('5/10')).not.toBeOnTheScreen();
  });

  it('방문 횟수와 목표 횟수 요약 박스는 표시하지 않는다', () => {
    const { queryByText } = render(
      <QuestInfo
        verificationType="WEEKLY_APP_VISIT"
        currentVerificationCount={2}
        verificationTargetCount={7}
      />,
    );

    expect(queryByText('방문 횟수')).not.toBeOnTheScreen();
    expect(queryByText('목표 횟수')).not.toBeOnTheScreen();
  });
});
