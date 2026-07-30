import axiosInstance from '@repo/shared/api';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import { StyleSheet, View } from 'react-native';

import { blueTheme } from '@/theme/themes';
import { palette } from '@/theme/tokens';

import BetaFeedbackPage from '../../app/beta-feedback';
import { render } from '../setup/test-utils';

const mockLaunchImageLibraryAsync = jest.fn();
const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockGetInfoAsync = jest.fn();

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: () =>
    mockRequestMediaLibraryPermissionsAsync(),
  launchImageLibraryAsync: (options: unknown) =>
    mockLaunchImageLibraryAsync(options),
}));

jest.mock('expo-file-system', () => ({
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
}));

declare const mockBack: jest.Mock;
declare const mockShowToast: jest.Mock;

const CONTENT = '루틴 인증 화면에서 사진이 조금 늦게 뜨는 것 같아요.';

describe('베타 피드백 페이지', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockBack.mockClear();
    mockShowToast.mockClear();
    mockLaunchImageLibraryAsync.mockReset();
    mockRequestMediaLibraryPermissionsAsync.mockReset();
    mockGetInfoAsync.mockReset();
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('공통 설정 헤더와 선택한 안내형 시안의 입력 가이드를 표시한다', () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <BetaFeedbackPage />,
    );

    expect(getByText('베타 피드백')).toBeOnTheScreen();
    expect(getByText('작은 의견도 큰 도움이 돼요')).toBeOnTheScreen();
    expect(
      getByText('불편했던 순간을 조금만 자세히 알려주세요.'),
    ).toBeOnTheScreen();
    expect(getByText('이렇게 적어주시면 좋아요')).toBeOnTheScreen();
    expect(getByText('어떤 화면에서')).toBeOnTheScreen();
    expect(getByText('무엇을 하던 중에')).toBeOnTheScreen();
    expect(getByText('어떤 일이 있었는지')).toBeOnTheScreen();
    expect(getByText('0 / 1000')).toBeOnTheScreen();
    expect(getByText('피드백 내용을 입력해주세요.')).toBeOnTheScreen();
    expect(
      getByTestId('beta-feedback-submit-button').props.accessibilityState
        .disabled,
    ).toBe(true);

    fireEvent.press(getByLabelText('뒤로가기'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('선택 항목인 이미지 첨부 영역과 최대 3장 안내를 표시한다', () => {
    const { getByLabelText, getByText } = render(<BetaFeedbackPage />);

    expect(getByText('이미지 첨부')).toBeOnTheScreen();
    expect(getByText('선택')).toBeOnTheScreen();
    expect(getByText('0 / 3')).toBeOnTheScreen();
    expect(
      getByText('JPG, PNG, WEBP, HEIC/HEIF · 장당 최대 10MB'),
    ).toBeOnTheScreen();
    expect(getByLabelText('피드백 이미지 추가')).toBeEnabled();
  });

  it('색상 테마 배경에서도 안내와 입력 메타 정보를 읽기 쉬운 토큰으로 표시한다', () => {
    const { getByText } = render(<BetaFeedbackPage />);

    expect(
      StyleSheet.flatten(
        getByText('불편했던 순간을 조금만 자세히 알려주세요.').props.style,
      ),
    ).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[80],
      }),
    );
    expect(
      StyleSheet.flatten(getByText('이렇게 적어주시면 좋아요').props.style),
    ).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[100],
      }),
    );
    expect(StyleSheet.flatten(getByText('어떤 화면에서').props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[100],
      }),
    );
    expect(StyleSheet.flatten(getByText('피드백 내용').props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[100],
      }),
    );
    expect(StyleSheet.flatten(getByText('0 / 1000').props.style)).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[80],
      }),
    );
    expect(
      StyleSheet.flatten(getByText('피드백 내용을 입력해주세요.').props.style),
    ).toEqual(
      expect.objectContaining({
        color: palette.theme.blue[80],
      }),
    );
  });

  it('안내 영역 divider를 공통 테마 색상으로 표시한다', () => {
    const { UNSAFE_getAllByType } = render(<BetaFeedbackPage />);
    const guideSection = UNSAFE_getAllByType(View).find(
      (view) => StyleSheet.flatten(view.props.style)?.borderTopWidth === 1,
    );

    expect(StyleSheet.flatten(guideSection?.props.style)).toEqual(
      expect.objectContaining({
        borderTopColor: blueTheme.colors.border.divider,
      }),
    );
  });

  it('textarea 테두리를 옅은 gray 색상으로 표시한다', () => {
    const { getByTestId } = render(<BetaFeedbackPage />);

    expect(
      StyleSheet.flatten(
        getByTestId('beta-feedback-content-field').props.style,
      ),
    ).toEqual(
      expect.objectContaining({
        borderColor: palette.theme.gray[8],
      }),
    );
  });

  it('빈 입력 안내 문구 왼쪽에 시안의 파란 안내 아이콘을 표시한다', () => {
    const { getByTestId, getByText } = render(<BetaFeedbackPage />);
    const validationRow = getByTestId('beta-feedback-validation-row');
    const validationIcon = getByTestId('beta-feedback-validation-icon', {
      includeHiddenElements: true,
    });

    expect(getByText('피드백 내용을 입력해주세요.')).toBeOnTheScreen();
    expect(validationRow.props.children[0].props.testID).toBe(
      'beta-feedback-validation-icon',
    );
    expect(StyleSheet.flatten(validationRow.props.style)).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
      }),
    );
    expect(validationIcon.props).toEqual(
      expect.objectContaining({
        name: 'alert-circle-outline',
        size: 20,
        color: palette.stitch.primary,
      }),
    );
  });

  it('빈 입력 안내와 글자 수를 같은 행의 양쪽에 표시한다', () => {
    const { getByTestId } = render(<BetaFeedbackPage />);
    const fieldMetaRow = getByTestId('beta-feedback-field-meta-row');

    expect(StyleSheet.flatten(fieldMetaRow.props.style)).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }),
    );
    expect(fieldMetaRow.props.children[0].props.testID).toBe(
      'beta-feedback-validation-row',
    );
    expect(fieldMetaRow.props.children[1].props.testID).toBe(
      'beta-feedback-character-count',
    );
  });

  it('공백만 입력하면 제출하지 않는다', () => {
    const { getByLabelText, getByTestId } = render(<BetaFeedbackPage />);

    fireEvent.changeText(getByLabelText('피드백 내용'), '   ');
    fireEvent.press(getByTestId('beta-feedback-submit-button'));

    expect(mockAxios.history.post).toHaveLength(0);
    expect(
      getByTestId('beta-feedback-submit-button').props.accessibilityState
        .disabled,
    ).toBe(true);
  });

  it('1000자를 초과하면 오류를 표시하고 제출을 막는다', () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <BetaFeedbackPage />,
    );
    const tooLongContent = '가'.repeat(1001);

    fireEvent.changeText(getByLabelText('피드백 내용'), tooLongContent);

    expect(getByText('1001 / 1000')).toBeOnTheScreen();
    expect(getByText('피드백은 1000자 이하로 입력해주세요.')).toBeOnTheScreen();
    expect(
      getByTestId('beta-feedback-submit-button').props.accessibilityState
        .disabled,
    ).toBe(true);
  });

  it('유효한 피드백을 한 번 제출하고 성공 후 입력창을 비운다', async () => {
    mockAxios.onPost('/beta/feedback').reply((config) => {
      expect(JSON.parse(config.data ?? '{}')).toEqual({ content: CONTENT });

      return [
        201,
        {
          success: true,
          data: {
            feedbackId: 41,
            userId: 'test123',
            nickname: 'testuser',
            content: CONTENT,
            submittedAt: '2026-07-24T09:00:00+09:00',
          },
        },
      ];
    });

    const { getByLabelText, getByTestId, getByText } = render(
      <BetaFeedbackPage />,
    );
    const input = getByLabelText('피드백 내용');

    fireEvent.changeText(input, `  ${CONTENT}  `);
    expect(getByText(`${CONTENT.length + 4} / 1000`)).toBeOnTheScreen();
    fireEvent.press(getByTestId('beta-feedback-submit-button'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        '피드백이 제출되었습니다.',
        'success',
      );
    });

    expect(mockAxios.history.post).toHaveLength(1);
    expect(input.props.value).toBe('');
    expect(getByText('0 / 1000')).toBeOnTheScreen();
  });

  it('앨범에서 여러 이미지를 선택하고 개별 삭제할 수 있다', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///feedback-1.png',
          fileName: 'feedback-1.png',
          mimeType: 'image/png',
          fileSize: 512_000,
        },
        {
          uri: 'file:///feedback-2.heic',
          fileName: 'feedback-2.heic',
          mimeType: 'image/heic',
          fileSize: 1_024_000,
        },
      ],
    });
    const screen = render(<BetaFeedbackPage />);

    fireEvent.press(screen.getByLabelText('피드백 이미지 추가'));

    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeOnTheScreen();
      expect(screen.getAllByTestId('beta-feedback-image-preview')).toHaveLength(
        2,
      );
    });
    expect(mockLaunchImageLibraryAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 3,
      }),
    );

    fireEvent.press(screen.getByLabelText('첨부 이미지 1 삭제'));

    expect(screen.getByText('1 / 3')).toBeOnTheScreen();
    expect(screen.getAllByTestId('beta-feedback-image-preview')).toHaveLength(
      1,
    );
  });

  it('선택한 이미지들을 같은 images key로 반복해 multipart 전송한다', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');

    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///feedback-1.png',
          fileName: 'feedback-1.png',
          mimeType: 'image/png',
          fileSize: 512_000,
        },
        {
          uri: 'file:///feedback-2.webp',
          fileName: 'feedback-2.webp',
          mimeType: 'image/webp',
          fileSize: 1_024_000,
        },
      ],
    });
    mockAxios.onPost('/beta/feedback').reply((config) => {
      expect(config.data).toBeInstanceOf(FormData);

      return [
        201,
        {
          success: true,
          data: {
            feedbackId: 43,
            userId: 'test123',
            nickname: 'testuser',
            content: CONTENT,
            submittedAt: '2026-07-30T13:30:00+09:00',
          },
        },
      ];
    });
    const screen = render(<BetaFeedbackPage />);

    fireEvent.press(screen.getByLabelText('피드백 이미지 추가'));
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeOnTheScreen();
    });
    fireEvent.changeText(screen.getByLabelText('피드백 내용'), CONTENT);
    fireEvent.press(screen.getByTestId('beta-feedback-submit-button'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        '피드백이 제출되었습니다.',
        'success',
      );
    });
    expect(appendSpy).toHaveBeenCalledWith('content', CONTENT);
    expect(appendSpy).toHaveBeenCalledWith('images', {
      uri: 'file:///feedback-1.png',
      name: 'feedback-1.png',
      type: 'image/png',
    });
    expect(appendSpy).toHaveBeenCalledWith('images', {
      uri: 'file:///feedback-2.webp',
      name: 'feedback-2.webp',
      type: 'image/webp',
    });
    expect(screen.getByText('0 / 3')).toBeOnTheScreen();

    appendSpy.mockRestore();
  });

  it('허용하지 않는 이미지 형식은 추가하지 않고 이유를 안내한다', async () => {
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: 'file:///feedback.gif',
          fileName: 'feedback.gif',
          mimeType: 'image/gif',
          fileSize: 512_000,
        },
      ],
    });
    const screen = render(<BetaFeedbackPage />);

    fireEvent.press(screen.getByLabelText('피드백 이미지 추가'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'jpg, jpeg, png, webp, heic, heif 이미지만 업로드할 수 있습니다.',
        'error',
      );
    });
    expect(screen.getByText('0 / 3')).toBeOnTheScreen();
  });

  it('서버의 이미지 검증 오류 메시지를 그대로 안내한다', async () => {
    mockAxios.onPost('/beta/feedback').reply(400, {
      success: false,
      error: {
        message: '피드백 이미지는 최대 3장까지 첨부할 수 있습니다.',
      },
    });
    const screen = render(<BetaFeedbackPage />);

    fireEvent.changeText(screen.getByLabelText('피드백 내용'), CONTENT);
    fireEvent.press(screen.getByTestId('beta-feedback-submit-button'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        '피드백 이미지는 최대 3장까지 첨부할 수 있습니다.',
        'error',
      );
    });
  });

  it('제출 중에는 버튼을 비활성화해 중복 요청을 막는다', async () => {
    let resolveRequest:
      | ((
          response: [
            number,
            {
              success: boolean;
              data: {
                feedbackId: number;
                userId: string;
                nickname: string;
                content: string;
                submittedAt: string;
              };
            },
          ],
        ) => void)
      | undefined;

    mockAxios.onPost('/beta/feedback').reply(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { getByLabelText, getByTestId } = render(<BetaFeedbackPage />);
    const submitButton = getByTestId('beta-feedback-submit-button');

    fireEvent.changeText(getByLabelText('피드백 내용'), CONTENT);
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(
        getByTestId('beta-feedback-submit-button').props.accessibilityState
          .disabled,
      ).toBe(true);
    });

    fireEvent.press(getByTestId('beta-feedback-submit-button'));
    expect(mockAxios.history.post).toHaveLength(1);

    await act(async () => {
      resolveRequest?.([
        201,
        {
          success: true,
          data: {
            feedbackId: 41,
            userId: 'test123',
            nickname: 'testuser',
            content: CONTENT,
            submittedAt: '2026-07-24T09:00:00+09:00',
          },
        },
      ]);
    });
  });

  it('서버 오류 시 재시도 가능한 안내를 표시한다', async () => {
    mockAxios.onPost('/beta/feedback').reply(500, {
      success: false,
    });

    const { getByLabelText, getByTestId } = render(<BetaFeedbackPage />);

    fireEvent.changeText(getByLabelText('피드백 내용'), CONTENT);
    fireEvent.press(getByTestId('beta-feedback-submit-button'));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        '피드백 제출에 실패했습니다. 잠시 후 다시 시도해주세요.',
        'error',
      );
    });
  });
});
