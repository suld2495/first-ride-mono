import axiosInstance from '@repo/shared/api';
import { fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { StyleSheet } from 'react-native';

import HiddenRoutinesModal from '../../../components/modal/hidden-routines-modal';
import { palette } from '../../../theme/tokens';
import { render, resetAuthMocks } from '../../setup/auth-test-utils';
import { createMockRoutine } from '../../setup/routine/mock';

declare const mockShowToast: jest.Mock;

let mockAxios: MockAdapter;

const getPressableStyle = (style: unknown, pressed = false) =>
  StyleSheet.flatten(typeof style === 'function' ? style({ pressed }) : style);

describe('HiddenRoutinesModal', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockShowToast.mockClear();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('일시정지된 루틴 목록을 표시한다', async () => {
    mockAxios.onGet('/routine/list/paused').reply(200, {
      data: [
        {
          ...createMockRoutine(0, { paused: true }),
          routineName: '물 마시기',
        },
        {
          ...createMockRoutine(1, { paused: true }),
          routineName: '루틴 설정',
        },
      ],
    });

    const { findAllByText, findByText } = render(<HiddenRoutinesModal />);

    expect(await findByText('물 마시기')).toBeOnTheScreen();
    expect(await findByText('루틴 설정')).toBeOnTheScreen();
    expect(await findAllByText('숨기기 해제')).toHaveLength(2);
  });

  it('빈 상태 문구를 gray 90 컬러로 표시한다', async () => {
    mockAxios.onGet('/routine/list/paused').reply(200, {
      data: [],
    });

    const { findByText } = render(<HiddenRoutinesModal />);
    const message = await findByText('숨긴 루틴이 없습니다.');

    expect(StyleSheet.flatten(message.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
      }),
    );
  });

  it('루틴 목록과 해제 버튼을 지정된 디자인 값으로 표시한다', async () => {
    mockAxios.onGet('/routine/list/paused').reply(200, {
      data: [
        {
          ...createMockRoutine(0, { paused: true }),
          routineName: '물 마시기',
        },
        {
          ...createMockRoutine(1, { paused: true }),
          routineName: '루틴 설정',
        },
      ],
    });

    const { findAllByText, findByTestId, findByText } = render(
      <HiddenRoutinesModal />,
    );

    await findByText('물 마시기');

    const containerStyle = StyleSheet.flatten(
      (await findByTestId('hidden-routines-container')).props.style,
    );
    const rowStyle = StyleSheet.flatten(
      (await findByTestId('hidden-routine-row-1')).props.style,
    );
    const releaseButton = await findByTestId('hidden-routine-release-button-1');
    const releaseButtonStyle = getPressableStyle(releaseButton.props.style);
    const routineName = await findByTestId('hidden-routine-name-1');
    const releaseText = (await findAllByText('숨기기 해제'))[0];

    expect(containerStyle).toEqual(
      expect.objectContaining({
        paddingTop: 12,
        paddingBottom: 12,
        gap: 0,
      }),
    );
    expect(rowStyle).toEqual(
      expect.objectContaining({
        height: 44,
      }),
    );
    expect(routineName.props.fontSize).toBe('$body2');
    expect(routineName.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(routineName.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[60],
      }),
    );
    expect(releaseButtonStyle).toEqual(
      expect.objectContaining({
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: palette.white,
      }),
    );
    fireEvent(releaseButton, 'pressIn');

    const pressedReleaseButton = await findByTestId(
      'hidden-routine-release-button-1',
    );

    expect(getPressableStyle(pressedReleaseButton.props.style)).toEqual(
      expect.objectContaining({
        transform: [{ scale: 0.96 }],
      }),
    );
    expect(releaseText.props.fontSize).toBe('$caption2');
    expect(releaseText.props.fontWeight).toBe('600');
    expect(StyleSheet.flatten(releaseText.props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
      }),
    );
  });

  it('숨기기 해제를 누르면 요청 중인 버튼을 비활성화하고 스피너를 표시한다', async () => {
    mockAxios.onGet('/routine/list/paused').reply(200, {
      data: [
        {
          ...createMockRoutine(0, { paused: true }),
          routineName: '물 마시기',
        },
      ],
    });
    let resolvePauseRequest!: (
      value: [number, { data: { message: string } }],
    ) => void;
    mockAxios.onPatch('/routine/1/pause').reply(
      () =>
        new Promise((resolve) => {
          resolvePauseRequest = resolve;
        }),
    );

    const { findByTestId, findByText, getByTestId, queryByText } = render(
      <HiddenRoutinesModal />,
    );
    const releaseButton = await findByTestId('hidden-routine-release-button-1');

    fireEvent(releaseButton, 'layout', {
      nativeEvent: { layout: { height: 20, width: 68 } },
    });
    fireEvent.press(await findByText('숨기기 해제'));

    const pendingButton = await findByTestId('hidden-routine-release-button-1');
    const spinner = getByTestId('hidden-routine-release-spinner-1');

    expect(getPressableStyle(pendingButton.props.style)).toEqual(
      expect.objectContaining({
        width: 68,
        alignItems: 'center',
        justifyContent: 'center',
      }),
    );
    expect(StyleSheet.flatten(spinner.props.style)).toEqual(
      expect.objectContaining({
        width: 12,
        height: 12,
        borderRadius: 99,
        borderWidth: 2,
        borderColor: palette.theme.gray[90],
        borderTopColor: 'transparent',
      }),
    );
    expect(queryByText('숨기기 해제')).toBeNull();
    expect(spinner).toBeOnTheScreen();
    expect(pendingButton.props.accessibilityState).toEqual({
      disabled: true,
    });
    fireEvent.press(pendingButton);

    expect(mockAxios.history.patch).toHaveLength(1);

    resolvePauseRequest([
      200,
      {
        data: { message: '숨기기 해제되었습니다.' },
      },
    ]);

    await waitFor(() => {
      expect(mockAxios.history.patch[0]?.url).toBe('/routine/1/pause');
      expect(JSON.parse(mockAxios.history.patch[0]?.data)).toEqual({
        paused: false,
      });
      expect(mockShowToast).toHaveBeenCalledWith(
        '숨기기 해제되었습니다.',
        'success',
      );
    });
  });
});
