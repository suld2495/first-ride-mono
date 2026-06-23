import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { processColor, StyleSheet } from 'react-native';

import InquiryPage from '../../app/inquiry';
import NotificationSettingsPage from '../../app/notification-settings';
import RoutineSettingsPage from '../../app/routine-settings';
import { palette } from '../../theme/tokens';
import { render, resetAuthMocks } from '../setup/auth-test-utils';
import { createMockRoutine } from '../setup/routine/mock';

declare const mockBack: jest.Mock;
declare const mockPush: jest.Mock;
declare const mockShowToast: jest.Mock;

describe('설정 하위 페이지', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    resetAuthMocks();
    mockShowToast.mockClear();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet('/routine/list/all').reply(200, { data: [] });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it.each([
    ['전체 루틴 목록', <RoutineSettingsPage />],
    ['알림 설정', <NotificationSettingsPage />],
    ['문의', <InquiryPage />],
  ])('%s 페이지는 상단 타이틀과 뒤로가기를 표시한다', async (title, page) => {
    const { getByLabelText, getByTestId, getByText } = render(page);

    expect(getByText(title)).toBeOnTheScreen();

    if (title === '전체 루틴 목록') {
      await waitFor(() => {
        expect(getByTestId('routine-settings-routine-list')).toBeOnTheScreen();
      });
    }

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('전체 루틴 목록 페이지는 필터와 루틴 목록을 즉시 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/routine/list/all').reply(200, {
      data: [
        { ...createMockRoutine(0), routineName: '물 마시기' },
        {
          ...createMockRoutine(1, { paused: true }),
          routineName: '책 읽기',
        },
        {
          ...createMockRoutine(2, { hidden: true }),
          routineName: '명상하기',
        },
        {
          ...createMockRoutine(5, { hidden: true, paused: true }),
          routineName: '숨김 일시정지 루틴',
        },
        {
          ...createMockRoutine(3, {
            weeklyCount: 5,
            routineCount: 5,
          }),
          routineName: '목표 달성 루틴',
        },
        {
          ...createMockRoutine(4, {
            endDate: '2000-01-01',
          }),
          routineName: '종료된 루틴',
        },
      ],
    });

    const {
      findByText,
      getAllByTestId,
      getByTestId,
      getByText,
      queryByTestId,
      queryByText,
    } = render(<RoutineSettingsPage />);
    const contentStyle = StyleSheet.flatten(
      getByTestId('routine-settings-content').props.style,
    );
    const filterAreaStyle = StyleSheet.flatten(
      getByTestId('routine-settings-filter-area').props.style,
    );
    const statusFiltersStyle = StyleSheet.flatten(
      getByTestId('routine-settings-status-filters').props.style,
    );
    const activeStatusFilterStyle = StyleSheet.flatten(
      getByTestId('routine-status-filter-active').props.style,
    );
    const optionFiltersStyle = StyleSheet.flatten(
      getByTestId('routine-settings-option-filters').props.style,
    );
    const pausedCheckboxStyle = StyleSheet.flatten(
      getByTestId('routine-settings-paused-checkbox').props.style,
    );
    const activeStatusFilterText = getByText('진행 중');
    const pausedCheckboxLabel = getByTestId(
      'routine-settings-paused-checkbox-label',
    );

    expect(contentStyle).toEqual(
      expect.objectContaining({
        backgroundColor: palette.theme.blue[10],
      }),
    );
    expect(filterAreaStyle).toEqual(
      expect.objectContaining({
        paddingTop: 12,
      }),
    );
    expect(statusFiltersStyle).toEqual(
      expect.objectContaining({
        gap: 4,
      }),
    );
    expect(activeStatusFilterStyle).toEqual(
      expect.objectContaining({
        height: 32,
        paddingHorizontal: 12,
        backgroundColor: palette.theme.gray[90],
      }),
    );
    expect(activeStatusFilterText.props.fontSize).toBe('$body3');
    expect(activeStatusFilterText.props.fontWeight).toBe('600');
    expect(optionFiltersStyle).toEqual(
      expect.objectContaining({
        justifyContent: 'flex-start',
        gap: 12,
        marginTop: 16,
        marginBottom: 12,
      }),
    );
    expect(pausedCheckboxStyle).toEqual(
      expect.objectContaining({
        gap: 6,
      }),
    );
    expect(pausedCheckboxLabel.props.fontSize).toBe('$body3');
    expect(StyleSheet.flatten(pausedCheckboxLabel.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[90],
      }),
    );
    expect(await findByText('물 마시기')).toBeOnTheScreen();
    expect(await findByText('책 읽기')).toBeOnTheScreen();
    expect(await findByText('명상하기')).toBeOnTheScreen();
    expect(await findByText('목표 달성 루틴')).toBeOnTheScreen();
    expect(queryByText('종료된 루틴')).toBeNull();
    const firstRoutineRowStyle = StyleSheet.flatten(
      getByTestId('routine-settings-routine-row-1').props.style,
    );
    const firstRoutineText = getByText('물 마시기');
    const firstRoutineIconPath = getByTestId(
      'routine-settings-routine-icon-path-1-middle',
      { includeHiddenElements: true },
    );
    const bothStatusIconsStyle = StyleSheet.flatten(
      getByTestId('routine-settings-routine-status-icons-6').props.style,
    );
    const menuTriggerStyle = StyleSheet.flatten(
      getByTestId('routine-settings-routine-menu-trigger-1').props.style,
    );

    expect(firstRoutineRowStyle).toEqual(
      expect.objectContaining({
        paddingVertical: 10,
      }),
    );
    expect(firstRoutineText.props.fontSize).toBe('$body2');
    expect(StyleSheet.flatten(firstRoutineText.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
      }),
    );
    expect(firstRoutineIconPath.props.stroke).toEqual(
      expect.objectContaining({
        payload: processColor(palette.theme.softBlue[40]),
      }),
    );
    expect(
      getByTestId('routine-settings-routine-hidden-icon-3'),
    ).toBeOnTheScreen();
    expect(
      getByTestId('routine-settings-routine-paused-icon-2'),
    ).toBeOnTheScreen();
    expect(
      getByTestId('routine-settings-routine-hidden-icon-6'),
    ).toBeOnTheScreen();
    expect(
      getByTestId('routine-settings-routine-paused-icon-6'),
    ).toBeOnTheScreen();
    expect(queryByTestId('routine-settings-routine-hidden-icon-1')).toBeNull();
    expect(queryByTestId('routine-settings-routine-paused-icon-1')).toBeNull();
    expect(bothStatusIconsStyle).toEqual(
      expect.objectContaining({
        gap: 8,
      }),
    );
    expect(menuTriggerStyle).toEqual(
      expect.objectContaining({
        width: 24,
        height: 24,
        marginLeft: 4,
      }),
    );
    fireEvent.press(getByTestId('routine-settings-routine-menu-trigger-1'));

    expect(getByTestId('routine-context-menu-1')).toBeOnTheScreen();
    expect(
      getAllByTestId('routine-context-menu-item-text').map(
        (item) => item.props.children,
      ),
    ).toEqual(['수정', '숨김', '일시정지', '삭제']);
    expect(getByTestId('routine-context-menu-1')).toHaveStyle({
      width: 144,
    });
    expect(queryByTestId('routine-context-menu-backdrop')).toBeOnTheScreen();
    fireEvent.press(getByTestId('routine-context-menu-backdrop'));
    fireEvent.press(getByTestId('routine-settings-routine-menu-trigger-2'));

    expect(
      getAllByTestId('routine-context-menu-item-text').map(
        (item) => item.props.children,
      ),
    ).toEqual(['수정', '숨김', '시작', '삭제']);

    expect(getByTestId('routine-status-filter-active')).toBeOnTheScreen();
    expect(getByTestId('routine-status-filter-done')).toBeOnTheScreen();
    expect(getByTestId('routine-status-filter-upcoming')).toBeOnTheScreen();
    expect(getByTestId('routine-settings-paused-checkbox')).toBeOnTheScreen();
    expect(getByTestId('routine-settings-hidden-checkbox')).toBeOnTheScreen();
    fireEvent.press(getByTestId('routine-settings-paused-checkbox'));

    expect(queryByText('물 마시기')).toBeNull();
    expect(getByText('책 읽기')).toBeOnTheScreen();
    expect(queryByText('명상하기')).toBeNull();
    expect(getByText('숨김 일시정지 루틴')).toBeOnTheScreen();
    fireEvent.press(getByTestId('routine-settings-hidden-checkbox'));

    expect(getByText('책 읽기')).toBeOnTheScreen();
    expect(getByText('명상하기')).toBeOnTheScreen();
    expect(getByText('숨김 일시정지 루틴')).toBeOnTheScreen();
    fireEvent.press(getByTestId('routine-settings-paused-checkbox'));

    expect(queryByText('책 읽기')).toBeNull();
    expect(getByText('명상하기')).toBeOnTheScreen();
    expect(getByText('숨김 일시정지 루틴')).toBeOnTheScreen();
    fireEvent.press(getByTestId('routine-settings-hidden-checkbox'));

    expect(await findByText('물 마시기')).toBeOnTheScreen();
    expect(await findByText('책 읽기')).toBeOnTheScreen();
    expect(await findByText('명상하기')).toBeOnTheScreen();
    expect(await findByText('숨김 일시정지 루틴')).toBeOnTheScreen();
    expect(queryByTestId('routine-settings-hidden-routines-item')).toBeNull();
    fireEvent.press(getByTestId('routine-status-filter-done'));

    expect(await findByText('종료된 루틴')).toBeOnTheScreen();
    expect(queryByText('목표 달성 루틴')).toBeNull();

    await waitFor(() => {
      expect(
        mockAxios.history.get.some(
          (request) => request.url === '/routine/list/all',
        ),
      ).toBe(true);
    });
    expect(mockPush).not.toHaveBeenCalledWith('/modal?type=hidden-routines');
  });

  it('전체 루틴 목록 페이지는 조건에 맞는 옵션 루틴이 없으면 빈 목록을 표시한다', async () => {
    mockAxios.resetHandlers();
    mockAxios.onGet('/routine/list/all').reply(200, {
      data: [
        { ...createMockRoutine(0), routineName: '물 마시기' },
        { ...createMockRoutine(1), routineName: '책 읽기' },
      ],
    });

    const { findByText, getByTestId, queryByText } = render(
      <RoutineSettingsPage />,
    );

    expect(await findByText('물 마시기')).toBeOnTheScreen();
    const pausedCheckbox = getByTestId('routine-settings-paused-checkbox');
    const hiddenCheckbox = getByTestId('routine-settings-hidden-checkbox');

    expect(pausedCheckbox.props.accessibilityState).toEqual(
      expect.objectContaining({
        checked: false,
      }),
    );
    expect(hiddenCheckbox.props.accessibilityState).toEqual(
      expect.objectContaining({
        checked: false,
      }),
    );
    fireEvent.press(pausedCheckbox);

    expect(queryByText('물 마시기')).toBeNull();
    expect(queryByText('책 읽기')).toBeNull();
    expect(await findByText('루틴이 존재하지 않습니다.')).toBeOnTheScreen();
    expect(
      getByTestId('routine-settings-paused-checkbox').props.accessibilityState,
    ).toEqual(
      expect.objectContaining({
        checked: true,
      }),
    );
    fireEvent.press(pausedCheckbox);
    fireEvent.press(hiddenCheckbox);

    expect(queryByText('물 마시기')).toBeNull();
    expect(queryByText('책 읽기')).toBeNull();
    expect(await findByText('루틴이 존재하지 않습니다.')).toBeOnTheScreen();
    expect(
      getByTestId('routine-settings-hidden-checkbox').props.accessibilityState,
    ).toEqual(
      expect.objectContaining({
        checked: true,
      }),
    );
  });

  it('문의 페이지는 앱 안에서 작성한 내용을 이메일 문의로 전송한다', async () => {
    mockAxios.onPost('/inquiry').reply((config) => {
      expect(JSON.parse(config.data ?? '{}')).toEqual({
        recipientEmail: 'irura@gmail.com',
        subject: '이루라 건의사항',
        replyEmail: 'rider@example.com',
        title: '로그인이 안돼요',
        content: '카카오 로그인 버튼을 눌러도 다음 화면으로 넘어가지 않습니다.',
      });

      return [200, { data: undefined }];
    });

    const { getByLabelText, getByText } = render(<InquiryPage />);

    fireEvent.changeText(
      getByLabelText('답변 받을 이메일'),
      'rider@example.com',
    );
    fireEvent.changeText(getByLabelText('문의 제목'), '로그인이 안돼요');
    fireEvent.changeText(
      getByLabelText('문의 내용'),
      '카카오 로그인 버튼을 눌러도 다음 화면으로 넘어가지 않습니다.',
    );
    fireEvent.press(getByText('문의 보내기'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        '문의가 접수되었습니다.',
        'success',
      );
    });

    expect(getByLabelText('답변 받을 이메일').props.value).toBe('');
    expect(getByLabelText('문의 제목').props.value).toBe('');
    expect(getByLabelText('문의 내용').props.value).toBe('');
  });

  it('문의 페이지는 올바르지 않은 답변 이메일을 전송하지 않는다', () => {
    const { getByLabelText, getByText } = render(<InquiryPage />);

    fireEvent.changeText(getByLabelText('답변 받을 이메일'), 'wrong-email');
    fireEvent.changeText(getByLabelText('문의 제목'), '로그인이 안돼요');
    fireEvent.changeText(
      getByLabelText('문의 내용'),
      '카카오 로그인 버튼을 눌러도 다음 화면으로 넘어가지 않습니다.',
    );
    fireEvent.press(getByText('문의 보내기'));

    expect(getByText('올바른 이메일 주소를 입력해주세요.')).toBeOnTheScreen();
    expect(mockAxios.history.post).toHaveLength(0);
  });
});
