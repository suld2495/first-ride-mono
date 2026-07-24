import axiosInstance from '@repo/shared/api';
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import BetaFeedbackPage from '../../app/beta-feedback';
import { render } from '../setup/test-utils';

declare const mockBack: jest.Mock;
declare const mockShowToast: jest.Mock;

const CONTENT = '루틴 인증 화면에서 사진이 조금 늦게 뜨는 것 같아요.';

describe('베타 피드백 페이지', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockBack.mockClear();
    mockShowToast.mockClear();
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
