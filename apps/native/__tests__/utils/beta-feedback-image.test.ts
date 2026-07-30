const mockGetInfoAsync = jest.fn();

jest.mock('expo-file-system', () => ({
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
}));

import {
  MAX_BETA_FEEDBACK_IMAGE_BYTES,
  normalizeBetaFeedbackImage,
} from '@/utils/beta-feedback-image';

describe('beta-feedback-image', () => {
  beforeEach(() => {
    mockGetInfoAsync.mockReset();
  });

  it.each([
    ['capture.jpg', 'image/jpeg'],
    ['capture.jpeg', 'image/jpg'],
    ['capture.png', 'image/png'],
    ['capture.webp', 'image/webp'],
    ['capture.heic', 'image/heic'],
    ['capture.heif', 'image/heif'],
  ])('%s 형식의 이미지를 첨부 파일로 정규화한다', async (fileName, mimeType) => {
    await expect(
      normalizeBetaFeedbackImage({
        uri: `file:///${fileName}`,
        fileName,
        mimeType,
        fileSize: 1024,
      }),
    ).resolves.toEqual({
      uri: `file:///${fileName}`,
      name: fileName,
      type: mimeType,
      size: 1024,
    });

    expect(mockGetInfoAsync).not.toHaveBeenCalled();
  });

  it('대문자 확장자와 Content-Type을 소문자로 정규화한다', async () => {
    await expect(
      normalizeBetaFeedbackImage({
        uri: 'file:///CAPTURE.JPG',
        fileName: 'CAPTURE.JPG',
        mimeType: 'IMAGE/JPEG',
        fileSize: 1024,
      }),
    ).resolves.toEqual({
      uri: 'file:///CAPTURE.JPG',
      name: 'CAPTURE.JPG',
      type: 'image/jpeg',
      size: 1024,
    });
  });

  it('파일 크기 메타데이터가 없으면 로컬 파일 정보를 확인한다', async () => {
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: 2048,
    });

    await expect(
      normalizeBetaFeedbackImage({
        uri: 'file:///capture.png',
        fileName: 'capture.png',
        mimeType: 'image/png',
      }),
    ).resolves.toEqual({
      uri: 'file:///capture.png',
      name: 'capture.png',
      type: 'image/png',
      size: 2048,
    });
    expect(mockGetInfoAsync).toHaveBeenCalledWith('file:///capture.png');
  });

  it('허용하지 않는 확장자를 거부한다', async () => {
    await expect(
      normalizeBetaFeedbackImage({
        uri: 'file:///capture.gif',
        fileName: 'capture.gif',
        mimeType: 'image/gif',
        fileSize: 1024,
      }),
    ).rejects.toThrow(
      'jpg, jpeg, png, webp, heic, heif 이미지만 업로드할 수 있습니다.',
    );
  });

  it('허용하지 않는 Content-Type을 거부한다', async () => {
    await expect(
      normalizeBetaFeedbackImage({
        uri: 'file:///capture.png',
        fileName: 'capture.png',
        mimeType: 'application/octet-stream',
        fileSize: 1024,
      }),
    ).rejects.toThrow(
      'jpg, jpeg, png, webp, heic, heif 이미지만 업로드할 수 있습니다.',
    );
  });

  it('10MB를 초과한 이미지를 거부한다', async () => {
    await expect(
      normalizeBetaFeedbackImage({
        uri: 'file:///capture.png',
        fileName: 'capture.png',
        mimeType: 'image/png',
        fileSize: MAX_BETA_FEEDBACK_IMAGE_BYTES + 1,
      }),
    ).rejects.toThrow(
      '피드백 이미지는 1장당 최대 10MB까지 첨부할 수 있습니다.',
    );
  });
});
