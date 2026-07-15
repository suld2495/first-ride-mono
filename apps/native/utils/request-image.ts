import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export const MAX_REQUEST_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_REQUEST_IMAGE_PIXELS = 60_000_000;

const JPEG_COMPRESSION_QUALITY = 0.85;
const JPEG_MIME_TYPE = 'image/jpeg' as const;

export interface RequestImageSource {
  uri: string;
  width?: number;
  height?: number;
}

export interface RequestImage {
  uri: string;
  sourceUri: string;
  name: string;
  type: typeof JPEG_MIME_TYPE;
  size: number;
}

export interface NormalizeRequestImagesResult {
  images: RequestImage[];
  rejectedCount: number;
}

const exceedsPixelLimit = ({
  width,
  height,
}: Pick<RequestImageSource, 'width' | 'height'>): boolean =>
  typeof width === 'number' &&
  typeof height === 'number' &&
  width > 0 &&
  height > 0 &&
  width * height > MAX_REQUEST_IMAGE_PIXELS;

const normalizeRequestImage = async (
  source: RequestImageSource,
  index: number,
): Promise<RequestImage> => {
  if (!source.uri || exceedsPixelLimit(source)) {
    throw new Error('Unsupported request image');
  }

  const convertedImage = await ImageManipulator.manipulateAsync(
    source.uri,
    [],
    {
      compress: JPEG_COMPRESSION_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  if (exceedsPixelLimit(convertedImage)) {
    throw new Error('Request image exceeds the pixel limit');
  }

  const fileInfo = await FileSystem.getInfoAsync(convertedImage.uri);

  if (
    !fileInfo.exists ||
    typeof fileInfo.size !== 'number' ||
    fileInfo.size <= 0 ||
    fileInfo.size > MAX_REQUEST_IMAGE_BYTES
  ) {
    throw new Error('Request image exceeds the file size limit');
  }

  return {
    uri: convertedImage.uri,
    sourceUri: source.uri,
    name: `routine-confirm-${index + 1}.jpg`,
    type: JPEG_MIME_TYPE,
    size: fileInfo.size,
  };
};

export const normalizeRequestImages = async (
  sources: RequestImageSource[],
): Promise<NormalizeRequestImagesResult> => {
  let images: RequestImage[] = [];
  let rejectedCount = 0;

  for (const [index, source] of sources.entries()) {
    try {
      const image = await normalizeRequestImage(source, index);

      images = [...images, image];
    } catch {
      rejectedCount += 1;
    }
  }

  return {
    images,
    rejectedCount,
  };
};
