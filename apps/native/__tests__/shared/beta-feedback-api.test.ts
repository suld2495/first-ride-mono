import axiosInstance from '@repo/shared/api';
import { createBetaFeedback } from '@repo/shared/api/beta-feedback.api';
import MockAdapter from 'axios-mock-adapter';

describe('beta-feedback.api', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  it('피드백 내용만 POST body로 전송하고 저장된 피드백을 반환한다', async () => {
    mockAxios.onPost('/beta/feedback').reply((config) => {
      expect(config.headers?.Accept).toBe('application/json');
      expect(JSON.parse(config.data ?? '{}')).toEqual({
        content: '루틴 인증 화면에서 사진이 조금 늦게 뜨는 것 같아요.',
      });

      return [
        201,
        {
          success: true,
          data: {
            feedbackId: 41,
            userId: 'test123',
            nickname: 'testuser',
            content: '루틴 인증 화면에서 사진이 조금 늦게 뜨는 것 같아요.',
            submittedAt: '2026-07-24T09:00:00+09:00',
          },
        },
      ];
    });

    await expect(
      createBetaFeedback({
        content: '루틴 인증 화면에서 사진이 조금 늦게 뜨는 것 같아요.',
      }),
    ).resolves.toEqual({
      feedbackId: 41,
      userId: 'test123',
      nickname: 'testuser',
      content: '루틴 인증 화면에서 사진이 조금 늦게 뜨는 것 같아요.',
      submittedAt: '2026-07-24T09:00:00+09:00',
    });
  });

  it('이미지가 있으면 content와 images를 multipart body에 담아 전송한다', async () => {
    const appendSpy = jest.spyOn(FormData.prototype, 'append');
    const images = [
      {
        uri: 'file:///feedback-1.png',
        name: 'feedback-1.png',
        type: 'image/png',
        size: 512_000,
      },
      {
        uri: 'file:///feedback-2.heic',
        name: 'feedback-2.heic',
        type: 'image/heic',
        size: 1_024_000,
      },
    ];

    mockAxios.onPost('/beta/feedback').reply((config) => {
      expect(config.data).toBeInstanceOf(FormData);
      expect(config.timeout).toBe(60_000);

      return [
        201,
        {
          success: true,
          data: {
            feedbackId: 42,
            userId: 'test123',
            nickname: 'testuser',
            content: '화면이 깨지는 문제가 있어요.',
            submittedAt: '2026-07-30T13:30:00+09:00',
          },
        },
      ];
    });

    await createBetaFeedback({
      content: '화면이 깨지는 문제가 있어요.',
      images,
    });

    expect(appendSpy).toHaveBeenCalledWith(
      'content',
      '화면이 깨지는 문제가 있어요.',
    );
    expect(appendSpy).toHaveBeenCalledWith('images', {
      uri: 'file:///feedback-1.png',
      name: 'feedback-1.png',
      type: 'image/png',
    });
    expect(appendSpy).toHaveBeenCalledWith('images', {
      uri: 'file:///feedback-2.heic',
      name: 'feedback-2.heic',
      type: 'image/heic',
    });

    appendSpy.mockRestore();
  });
});
