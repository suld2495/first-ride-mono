import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { ScrollView, StyleSheet } from 'react-native';

import QuestDetailModal from '../../../components/modal/quest-detail-modal';
import { fireEvent, render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockQuest } from '../../setup/quest/mock';

declare const mockBack: jest.Mock;
declare const mockShowToast: jest.Mock;

const mockQuestStore = {
  questId: 1,
  setQuestId: jest.fn(),
  statusFilter: 'ALL',
  setStatusFilter: jest.fn(),
  typeFilter: 'ALL',
  setTypeFilter: jest.fn(),
};

jest.mock('@/store/quest.store', () => ({
  useQuestStore: (selector: (state: typeof mockQuestStore) => unknown) =>
    selector(mockQuestStore),
}));

jest.mock('../../../components/ui/button', () => ({
  __esModule: true,
  Button: ({
    title,
    onPress,
    disabled,
    style,
    textStyle,
    backgroundColor,
    textColor,
    testID,
  }: {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
    style?: unknown;
    textStyle?: unknown;
    backgroundColor?: string;
    textColor?: string;
    testID?: string;
  }) => {
    const { Pressable, Text } = require('react-native');

    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={disabled}
        style={[style, backgroundColor && { backgroundColor }]}
      >
        <Text style={[textStyle, textColor && { color: textColor }]}>
          {title}
        </Text>
      </Pressable>
    );
  },
}));

let mockAxios: MockAdapter;

describe('QuestDetailModal', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockQuestStore.questId = 1;
    mockShowToast.mockClear();
    mockBack.mockClear();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('이미 수락한 퀘스트는 보상 받기 버튼을 표시한다', async () => {
    const mockDetail = createMockQuest(0, {
      isAccepted: true,
      isCompleted: false,
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findByText } = render(<QuestDetailModal />);

    expect(await findByText('보상 받기')).toBeOnTheScreen();
  });

  it('상태 배지는 한 번만 표시된다', async () => {
    const mockDetail = createMockQuest(0, {
      questType: 'WEEKLY',
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findAllByText } = render(<QuestDetailModal />);

    expect(await findAllByText('참여 가능')).toHaveLength(1);
  });

  it('타이틀 아래 설명 박스는 표시하지 않는다', async () => {
    const mockDetail = createMockQuest(0, {
      description: '상세 설명은 새 구성에서 숨긴다',
      questType: 'WEEKLY',
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findByText, queryByText } = render(<QuestDetailModal />);

    expect(await findByText('테스트 퀘스트 1')).toBeOnTheScreen();
    expect(queryByText('상세 설명은 새 구성에서 숨긴다')).not.toBeOnTheScreen();
  });

  it('이미지 시안 기준의 핵심 구성품을 상세 카드 안에 배치한다', async () => {
    const mockDetail = createMockQuest(0, {
      currentVerificationCount: 2,
      endDate: '2026-06-18T00:00:00.000Z',
      isAccepted: true,
      verificationTargetCount: 7,
    });

    mockDetail.questName = '일주일 내내 어플 들어오기';
    mockDetail.startDate = '2026-06-16T00:00:00.000Z';
    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const screen = render(<QuestDetailModal />);

    expect(await screen.findByText('진행 중')).toBeOnTheScreen();
    expect(screen.getByText('일주일 내내 어플 들어오기')).toBeOnTheScreen();
    expect(screen.getByText('2/7')).toBeOnTheScreen();
    expect(screen.getByText('기간 6-16 ~ 18')).toBeOnTheScreen();
    expect(screen.getByTestId('quest-detail-progress-track')).toBeOnTheScreen();
    expect(
      screen.getByTestId('quest-detail-image-placeholder'),
    ).toBeOnTheScreen();
    expect(screen.getByText('보상 받기')).toBeOnTheScreen();
  });

  it('목표 인증 횟수가 비어 있어도 진행률 분모를 최소 1로 표시한다', async () => {
    const mockDetail = createMockQuest(0, {
      currentVerificationCount: 0,
    });

    delete (mockDetail as Partial<typeof mockDetail>).verificationTargetCount;
    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const screen = render(<QuestDetailModal />);

    expect(await screen.findByText('0/1')).toBeOnTheScreen();
    expect(screen.queryByText('0/')).not.toBeOnTheScreen();
  });

  it('상세 콘텐츠의 배치와 기본 스타일 값을 적용한다', async () => {
    const mockDetail = createMockQuest(0, {
      currentVerificationCount: 2,
      endDate: '2026-06-18T00:00:00.000Z',
      isAccepted: true,
      verificationTargetCount: 7,
    });

    mockDetail.questName = '일주일 내내 어플 들어오기';
    mockDetail.startDate = '2026-06-16T00:00:00.000Z';
    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const screen = render(<QuestDetailModal />);

    await screen.findByText('진행 중');

    const innerFrameStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-card-inner').props.style,
    );
    const contentStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-content').props.style,
    );
    const statusBadgeStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-status-badge').props.style,
    );
    const statusText = screen.getByText('진행 중');
    const statusTextStyle = StyleSheet.flatten(statusText.props.style);
    const title = screen.getByText('일주일 내내 어플 들어오기');
    const titleStyle = StyleSheet.flatten(title.props.style);
    const progressRowStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-progress-row').props.style,
    );
    const progressTrackStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-progress-track').props.style,
    );
    const progressValue = screen.getByText('2/7');
    const progressValueStyle = StyleSheet.flatten(progressValue.props.style);
    const imageStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-image-placeholder').props.style,
    );
    const periodBadgeStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-period-badge').props.style,
    );
    const periodText = screen.getByText('기간 6-16 ~ 18');
    const periodTextStyle = StyleSheet.flatten(periodText.props.style);
    const buttonWrapperStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-reward-button-wrapper').props.style,
    );
    const rewardButtonStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-reward-button').props.style,
    );
    const rewardButtonTextStyle = StyleSheet.flatten(
      screen.getByText('보상 받기').props.style,
    );

    expect(innerFrameStyle).toMatchObject({
      flex: 1,
      justifyContent: 'space-between',
      paddingBottom: 0,
      paddingHorizontal: 17,
      paddingTop: 0,
    });
    expect(contentStyle).toMatchObject({
      flex: 1,
      paddingBottom: 24,
      paddingTop: 33,
    });
    expect(statusBadgeStyle).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: '#0984e3',
      borderRadius: 4,
      borderWidth: 1,
      height: 17,
      paddingHorizontal: 3,
    });
    expect(statusBadgeStyle.paddingVertical).toBeUndefined();
    expect(statusText.props.fontSize).toBe('$caption2');
    expect(statusText.props.fontWeight).toBe('600');
    expect(statusTextStyle).toMatchObject({
      color: '#0984e3',
    });
    expect(title.props.fontSize).toBe('$subtitle2');
    expect(title.props.fontWeight).toBe('600');
    expect(titleStyle).toMatchObject({
      color: '#FFFFFF',
      marginTop: 14,
    });
    expect(progressRowStyle).toMatchObject({
      gap: 8,
      marginTop: 36,
    });
    expect(progressTrackStyle).toMatchObject({
      backgroundColor: '#999999',
      borderRadius: 999,
      height: 8,
      width: 115,
    });
    expect(progressValue.props.fontSize).toBe('$caption2');
    expect(progressValue.props.fontWeight).toBe('600');
    expect(progressValueStyle).toMatchObject({
      color: '#FFFFFF',
    });
    expect(imageStyle).toMatchObject({
      borderRadius: 12,
      height: 140,
      marginTop: 36,
      width: 140,
    });
    expect(periodBadgeStyle).toMatchObject({
      backgroundColor: '#000306',
      borderRadius: 8,
      height: 24,
      marginTop: 32,
      paddingHorizontal: 8,
      paddingVertical: 4,
    });
    expect(periodText.props.fontSize).toBe('$caption2');
    expect(periodText.props.fontWeight).toBe('600');
    expect(periodTextStyle).toMatchObject({
      color: '#B0B4BA',
    });
    expect(buttonWrapperStyle).toMatchObject({
      marginBottom: 33,
      paddingHorizontal: 21,
      width: '100%',
    });
    expect(rewardButtonStyle).toMatchObject({
      borderRadius: 6,
      elevation: 0,
      height: 36,
      shadowOpacity: 0,
      shadowRadius: 0,
      width: '100%',
    });
    expect(rewardButtonTextStyle).toMatchObject({
      color: '#18191B',
    });
  });

  it('비활성화된 보상 받기 버튼은 비활성화 컬러를 사용한다', async () => {
    const mockDetail = createMockQuest(0, {
      isAccepted: true,
      isCompleted: true,
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const screen = render(<QuestDetailModal />);

    await screen.findByText('보상 받기');

    const rewardButtonStyle = StyleSheet.flatten(
      screen.getByTestId('quest-detail-reward-button').props.style,
    );
    const rewardButtonTextStyle = StyleSheet.flatten(
      screen.getByText('보상 받기').props.style,
    );

    expect(rewardButtonStyle).toMatchObject({
      backgroundColor: '#999999',
      opacity: 1,
    });
    expect(rewardButtonTextStyle).toMatchObject({
      color: '#999999',
    });
  });

  it('퀘스트 리스트와 동일한 2겹 컨테이너 스타일을 사용한다', async () => {
    const mockDetail = createMockQuest();

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findByTestId } = render(<QuestDetailModal />);

    const outerFrameStyle = StyleSheet.flatten(
      (await findByTestId('quest-detail-card-outer')).props.style,
    );
    const innerFrameStyle = StyleSheet.flatten(
      (await findByTestId('quest-detail-card-inner')).props.style,
    );

    expect(outerFrameStyle).toMatchObject({
      borderColor: '#2D3436',
      borderRadius: 14,
      borderWidth: 2,
      backgroundColor: '#FFFFFF',
      padding: 2,
    });
    expect(innerFrameStyle).toMatchObject({
      borderColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 3,
      backgroundColor: '#2D3436',
    });
  });

  it('공통 모달 패딩과 중첩되는 내부 좌우 패딩을 추가하지 않는다', async () => {
    const mockDetail = createMockQuest();

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const screen = render(<QuestDetailModal />);

    await screen.findByText('테스트 퀘스트 1');

    const scrollView = screen.UNSAFE_getByType(ScrollView);
    const scrollContentStyle = StyleSheet.flatten(
      scrollView.props.contentContainerStyle,
    );

    expect(scrollContentStyle.padding).toBeUndefined();
    expect(scrollContentStyle.paddingVertical).toBeUndefined();
    expect(scrollContentStyle.paddingTop).toBe(0);
    expect(scrollContentStyle.paddingHorizontal).toBeUndefined();
    expect(scrollContentStyle.paddingLeft).toBeUndefined();
    expect(scrollContentStyle.paddingRight).toBeUndefined();
  });

  it('보상 받기 버튼을 누르면 complete API를 호출하고 성공 토스트를 표시한다', async () => {
    const mockDetail = createMockQuest(0, {
      isAccepted: true,
      isCompleted: false,
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });
    mockAxios
      .onPost('/quest/complete', { questId: 1 })
      .reply(200, { data: null });

    const { findByText, getByText } = render(<QuestDetailModal />);

    await findByText('보상 받기');

    await act(async () => {
      fireEvent.press(getByText('보상 받기'));
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('완료되었습니다.', 'success');
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it('만료된 퀘스트는 만료 상태를 표시하고 참여 버튼은 표시하지 않는다', async () => {
    const mockDetail = createMockQuest(0, {
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findAllByText, queryByText } = render(<QuestDetailModal />);

    expect(await findAllByText('만료')).toHaveLength(1);

    await waitFor(() => {
      expect(queryByText('참여')).not.toBeOnTheScreen();
    });
  });
});
