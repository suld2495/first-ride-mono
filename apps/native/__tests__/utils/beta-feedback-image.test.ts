const mockGetInfoAsync = jest.fn();
const mockManipulateAsync = jest.fn();

jest.mock('expo-file-system', () => ({
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: (...args: unknown[]) => mockManipulateAsync(...args),
  SaveFormat: { JPEG: 'jpeg' },
}));

import {
  MAX_BETA_FEEDBACK_IMAGE_BYTES,
  MAX_BETA_FEEDBACK_IMAGE_PIXELS,
  normalizeBetaFeedbackImage,
} from '@/utils/beta-feedback-image';

describe('beta-feedback-image', () => {
  beforeEach(() => {
    mockGetInfoAsync.mockReset();
    mockManipulateAsync.mockReset();
    mockManipulateAsync.mockResolvedValue({
      uri: 'file:///normalized/beta-feedback.jpg',
      width: 1_200,
      height: 800,
    });
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: 512_000,
    });
  });

  it.each(['capture.png', 'capture.webp', 'capture.heic', 'capture.gif'])(
    '%s 원본을 JPEG 첨부 파일로 변환한다',
    async (fileName) => {
      await expect(
        normalizeBetaFeedbackImage(
          {
            uri: `file:///${fileName}`,
            width: 1_200,
            height: 800,
          },
          0,
        ),
      ).resolves.toEqual({
        uri: 'file:///normalized/beta-feedback.jpg',
        sourceUri: `file:///${fileName}`,
        name: 'beta-feedback-1.jpg',
        type: 'image/jpeg',
        size: 512_000,
      });

      expect(mockManipulateAsync).toHaveBeenCalledWith(
        `file:///${fileName}`,
        [],
        {
          compress: 0.85,
          format: 'jpeg',
        },
      );
      expect(mockGetInfoAsync).toHaveBeenCalledWith(
        'file:///normalized/beta-feedback.jpg',
      );
    },
  );

  it('변환된 JPEG가 정확히 10MB이면 첨부할 수 있다', async () => {
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: MAX_BETA_FEEDBACK_IMAGE_BYTES,
    });

    await expect(
      normalizeBetaFeedbackImage({ uri: 'file:///capture.png' }, 1),
    ).resolves.toEqual(
      expect.objectContaining({
        name: 'beta-feedback-2.jpg',
        type: 'image/jpeg',
        size: MAX_BETA_FEEDBACK_IMAGE_BYTES,
      }),
    );
  });

  it('변환된 JPEG가 10MB를 초과하면 첨부를 거부한다', async () => {
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: MAX_BETA_FEEDBACK_IMAGE_BYTES + 1,
    });

    await expect(
      normalizeBetaFeedbackImage({ uri: 'file:///capture.png' }, 0),
    ).rejects.toThrow(
      '피드백 이미지는 1장당 최대 10MB까지 첨부할 수 있습니다.',
    );
  });

  it('원본 이미지의 픽셀 수가 제한을 초과하면 변환하지 않는다', async () => {
    await expect(
      normalizeBetaFeedbackImage(
        {
          uri: 'file:///huge.heic',
          width: MAX_BETA_FEEDBACK_IMAGE_PIXELS,
          height: 2,
        },
        0,
      ),
    ).rejects.toThrow('이미지를 변환하지 못했습니다.');

    expect(mockManipulateAsync).not.toHaveBeenCalled();
  });

  it('변환된 이미지의 픽셀 수가 제한을 초과하면 첨부를 거부한다', async () => {
    mockManipulateAsync.mockResolvedValue({
      uri: 'file:///normalized/huge.jpg',
      width: MAX_BETA_FEEDBACK_IMAGE_PIXELS,
      height: 2,
    });

    await expect(
      normalizeBetaFeedbackImage({ uri: 'file:///capture.png' }, 0),
    ).rejects.toThrow('이미지를 변환하지 못했습니다.');

    expect(mockGetInfoAsync).not.toHaveBeenCalled();
  });

  it('JPEG 변환에 실패하면 사용자용 오류를 반환한다', async () => {
    mockManipulateAsync.mockRejectedValue(new Error('native conversion error'));

    await expect(
      normalizeBetaFeedbackImage({ uri: 'file:///capture.png' }, 0),
    ).rejects.toThrow('이미지를 변환하지 못했습니다.');
  });

  it('변환된 파일 정보를 확인할 수 없으면 첨부를 거부한다', async () => {
    mockGetInfoAsync.mockResolvedValue({
      exists: false,
    });

    await expect(
      normalizeBetaFeedbackImage({ uri: 'file:///capture.png' }, 0),
    ).rejects.toThrow(
      '피드백 이미지는 1장당 최대 10MB까지 첨부할 수 있습니다.',
    );
  });

  it('URI가 비어 있는 이미지를 거부한다', async () => {
    await expect(normalizeBetaFeedbackImage({ uri: '' }, 0)).rejects.toThrow(
      '이미지를 변환하지 못했습니다.',
    );

    expect(mockManipulateAsync).not.toHaveBeenCalled();
  });
});
