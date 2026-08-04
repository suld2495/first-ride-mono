const mockManipulateAsync = jest.fn();
const mockGetInfoAsync = jest.fn();

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: (...args: unknown[]) => mockManipulateAsync(...args),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
}));

import {
  MAX_REQUEST_IMAGE_BYTES,
  MAX_REQUEST_IMAGE_DIMENSION,
  normalizeRequestImages,
} from '@/utils/request-image';

describe('normalizeRequestImages', () => {
  beforeEach(() => {
    mockManipulateAsync.mockReset();
    mockGetInfoAsync.mockReset();
  });

  it('선택한 이미지를 JPEG 파일로 변환한다', async () => {
    mockManipulateAsync.mockResolvedValue({
      uri: 'file:///cache/converted.jpg',
      width: 1200,
      height: 800,
    });
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: 512_000,
    });

    const result = await normalizeRequestImages([
      {
        uri: 'file:///library/image.heic',
        width: 1200,
        height: 800,
      },
    ]);

    expect(mockManipulateAsync).toHaveBeenCalledWith(
      'file:///library/image.heic',
      [],
      expect.objectContaining({ format: 'jpeg' }),
    );
    expect(result).toEqual({
      images: [
        {
          uri: 'file:///cache/converted.jpg',
          sourceUri: 'file:///library/image.heic',
          name: 'routine-confirm-1.jpg',
          type: 'image/jpeg',
          size: 512_000,
        },
      ],
      rejectedCount: 0,
    });
  });

  it('가로 이미지의 긴 변이 최대 크기를 넘으면 너비를 줄인다', async () => {
    mockManipulateAsync.mockResolvedValue({
      uri: 'file:///cache/resized-landscape.jpg',
      width: MAX_REQUEST_IMAGE_DIMENSION,
      height: 1_280,
    });
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: 768_000,
    });

    await normalizeRequestImages([
      {
        uri: 'file:///library/landscape.heic',
        width: 4_032,
        height: 3_024,
      },
    ]);

    expect(mockManipulateAsync).toHaveBeenCalledWith(
      'file:///library/landscape.heic',
      [{ resize: { width: MAX_REQUEST_IMAGE_DIMENSION } }],
      expect.objectContaining({ format: 'jpeg' }),
    );
  });

  it('세로 이미지의 긴 변이 최대 크기를 넘으면 높이를 줄인다', async () => {
    mockManipulateAsync.mockResolvedValue({
      uri: 'file:///cache/resized-portrait.jpg',
      width: 1_280,
      height: MAX_REQUEST_IMAGE_DIMENSION,
    });
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: 768_000,
    });

    await normalizeRequestImages([
      {
        uri: 'file:///library/portrait.heic',
        width: 3_024,
        height: 4_032,
      },
    ]);

    expect(mockManipulateAsync).toHaveBeenCalledWith(
      'file:///library/portrait.heic',
      [{ resize: { height: MAX_REQUEST_IMAGE_DIMENSION } }],
      expect.objectContaining({ format: 'jpeg' }),
    );
  });

  it('변환할 수 없는 이미지는 결과에서 제외한다', async () => {
    mockManipulateAsync
      .mockRejectedValueOnce(new Error('unsupported image'))
      .mockResolvedValueOnce({
        uri: 'file:///cache/valid.jpg',
        width: 100,
        height: 100,
      });
    mockGetInfoAsync.mockResolvedValue({ exists: true, size: 1_024 });

    const result = await normalizeRequestImages([
      { uri: 'file:///library/invalid.bin' },
      { uri: 'file:///library/valid.webp' },
    ]);

    expect(result.images).toEqual([
      {
        uri: 'file:///cache/valid.jpg',
        sourceUri: 'file:///library/valid.webp',
        name: 'routine-confirm-2.jpg',
        type: 'image/jpeg',
        size: 1_024,
      },
    ]);
    expect(result.rejectedCount).toBe(1);
  });

  it('최대 해상도를 초과한 이미지는 변환하지 않는다', async () => {
    const result = await normalizeRequestImages([
      {
        uri: 'file:///library/too-large.png',
        width: 10_000,
        height: 6_001,
      },
    ]);

    expect(mockManipulateAsync).not.toHaveBeenCalled();
    expect(result).toEqual({ images: [], rejectedCount: 1 });
  });

  it('변환된 JPEG가 이미지당 제한을 초과하면 제외한다', async () => {
    mockManipulateAsync.mockResolvedValue({
      uri: 'file:///cache/too-large.jpg',
      width: 100,
      height: 100,
    });
    mockGetInfoAsync.mockResolvedValue({
      exists: true,
      size: MAX_REQUEST_IMAGE_BYTES + 1,
    });

    const result = await normalizeRequestImages([
      { uri: 'file:///library/large.gif' },
    ]);

    expect(result).toEqual({ images: [], rejectedCount: 1 });
  });
});
