import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

export const MAX_BETA_FEEDBACK_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_BETA_FEEDBACK_IMAGE_PIXELS = 60_000_000;
export const MAX_BETA_FEEDBACK_IMAGE_DIMENSION = 1_920;

export const BETA_FEEDBACK_IMAGE_CONVERSION_ERROR =
  '이미지를 변환하지 못했습니다.';
export const BETA_FEEDBACK_IMAGE_SIZE_ERROR =
  '피드백 이미지는 1장당 최대 10MB까지 첨부할 수 있습니다.';

const JPEG_COMPRESSION_QUALITY = 0.85;
const JPEG_MIME_TYPE = 'image/jpeg' as const;

export interface BetaFeedbackImageSource {
  uri: string;
  width?: number;
  height?: number;
}

export interface BetaFeedbackImage {
  uri: string;
  sourceUri: string;
  name: string;
  type: typeof JPEG_MIME_TYPE;
  size: number;
}

const exceedsPixelLimit = ({
  width,
  height,
}: Pick<BetaFeedbackImageSource, 'width' | 'height'>): boolean =>
  typeof width === 'number' &&
  typeof height === 'number' &&
  width > 0 &&
  height > 0 &&
  width * height > MAX_BETA_FEEDBACK_IMAGE_PIXELS;

const getResizeActions = ({
  width,
  height,
}: BetaFeedbackImageSource): ImageManipulator.Action[] => {
  if (
    typeof width !== 'number' ||
    typeof height !== 'number' ||
    width <= 0 ||
    height <= 0 ||
    Math.max(width, height) <= MAX_BETA_FEEDBACK_IMAGE_DIMENSION
  ) {
    return [];
  }

  return width >= height
    ? [{ resize: { width: MAX_BETA_FEEDBACK_IMAGE_DIMENSION } }]
    : [{ resize: { height: MAX_BETA_FEEDBACK_IMAGE_DIMENSION } }];
};

const convertToJpeg = async (
  source: BetaFeedbackImageSource,
): Promise<ImageManipulator.ImageResult> => {
  if (!source.uri || exceedsPixelLimit(source)) {
    throw new Error(BETA_FEEDBACK_IMAGE_CONVERSION_ERROR);
  }

  try {
    const convertedImage = await ImageManipulator.manipulateAsync(
      source.uri,
      getResizeActions(source),
      {
        compress: JPEG_COMPRESSION_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    if (exceedsPixelLimit(convertedImage)) {
      throw new Error(BETA_FEEDBACK_IMAGE_CONVERSION_ERROR);
    }

    return convertedImage;
  } catch {
    throw new Error(BETA_FEEDBACK_IMAGE_CONVERSION_ERROR);
  }
};

export const normalizeBetaFeedbackImage = async (
  source: BetaFeedbackImageSource,
  index: number,
): Promise<BetaFeedbackImage> => {
  const convertedImage = await convertToJpeg(source);
  const fileInfo = await FileSystem.getInfoAsync(convertedImage.uri);

  if (
    !fileInfo.exists ||
    typeof fileInfo.size !== 'number' ||
    fileInfo.size <= 0 ||
    fileInfo.size > MAX_BETA_FEEDBACK_IMAGE_BYTES
  ) {
    throw new Error(BETA_FEEDBACK_IMAGE_SIZE_ERROR);
  }

  return {
    uri: convertedImage.uri,
    sourceUri: source.uri,
    name: `beta-feedback-${index + 1}.jpg`,
    type: JPEG_MIME_TYPE,
    size: fileInfo.size,
  };
};
