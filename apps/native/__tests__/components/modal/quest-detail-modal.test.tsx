import axiosInstance from '@repo/shared/api';
import { act, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

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

jest.mock('../../../components/quest/quest-info', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../components/quest/quest-rewards', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../components/quest/quest-time', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../../components/ui/button', () => ({
  __esModule: true,
  Button: ({
    title,
    onPress,
    disabled,
  }: {
    title: string;
    onPress?: () => void;
    disabled?: boolean;
  }) => {
    const { Pressable, Text } = require('react-native');

    return (
      <Pressable onPress={onPress} disabled={disabled}>
        <Text>{title}</Text>
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

  it('이미 수락한 퀘스트는 완료 버튼을 표시한다', async () => {
    const mockDetail = createMockQuest(0, {
      isAccepted: true,
      isCompleted: false,
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findByText } = render(<QuestDetailModal />);

    expect(await findByText('완료')).toBeOnTheScreen();
  });

  it('퀘스트 타입 배지는 한 번만 표시된다', async () => {
    const mockDetail = createMockQuest(0, {
      questType: 'WEEKLY',
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findAllByText } = render(<QuestDetailModal />);

    expect(await findAllByText('주간 퀘스트')).toHaveLength(1);
  });

  it('타이틀 아래 설명 박스는 표시하지 않는다', async () => {
    const mockDetail = createMockQuest(0, {
      questType: 'WEEKLY',
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findAllByText } = render(<QuestDetailModal />);

    expect(await findAllByText('주간 퀘스트')).toHaveLength(1);
  });

  it('완료 버튼을 누르면 complete API를 호출하고 성공 토스트를 표시한다', async () => {
    const mockDetail = createMockQuest(0, {
      isAccepted: true,
      isCompleted: false,
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });
    mockAxios
      .onPost('/quest/complete', { questId: 1 })
      .reply(200, { data: null });

    const { findByText, getByText } = render(<QuestDetailModal />);

    await findByText('완료');

    await act(async () => {
      fireEvent.press(getByText('완료'));
    });

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('완료되었습니다.', 'success');
      expect(mockBack).toHaveBeenCalled();
    });
  });

  it('만료된 퀘스트는 참여 버튼 대신 만료 표시를 남긴다', async () => {
    const mockDetail = createMockQuest(0, {
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    });

    mockAxios.onGet('/quest/1').reply(200, { data: mockDetail });

    const { findByText, queryByText } = render(<QuestDetailModal />);

    expect(await findByText('만료')).toBeOnTheScreen();

    await waitFor(() => {
      expect(queryByText('참여')).not.toBeOnTheScreen();
    });
  });
});
