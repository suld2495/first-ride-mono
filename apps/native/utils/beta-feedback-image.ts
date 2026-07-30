import * as FileSystem from 'expo-file-system';

export const MAX_BETA_FEEDBACK_IMAGE_BYTES = 10 * 1024 * 1024;

export const BETA_FEEDBACK_IMAGE_TYPE_ERROR =
  'jpg, jpeg, png, webp, heic, heif 이미지만 업로드할 수 있습니다.';
export const BETA_FEEDBACK_IMAGE_SIZE_ERROR =
  '피드백 이미지는 1장당 최대 10MB까지 첨부할 수 있습니다.';

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'heif',
]);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

export interface BetaFeedbackImageSource {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
}

export interface BetaFeedbackImage {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const getFileExtension = (fileName: string): string => {
  const path = fileName.split(/[?#]/, 1)[0] ?? '';
  const extension = path.match(/\.([^.]+)$/)?.[1];

  return extension?.toLowerCase() ?? '';
};

const getImageSize = async (
  source: BetaFeedbackImageSource,
): Promise<number> => {
  if (typeof source.fileSize === 'number' && source.fileSize > 0) {
    return source.fileSize;
  }

  const fileInfo = await FileSystem.getInfoAsync(source.uri);

  if (
    !fileInfo.exists ||
    typeof fileInfo.size !== 'number' ||
    fileInfo.size <= 0
  ) {
    throw new Error('이미지 파일 정보를 확인할 수 없습니다.');
  }

  return fileInfo.size;
};

export const normalizeBetaFeedbackImage = async (
  source: BetaFeedbackImageSource,
): Promise<BetaFeedbackImage> => {
  const rawName = source.fileName || source.uri.split('/').pop() || '';
  const name = rawName.split(/[?#]/, 1)[0] ?? '';
  const extension = getFileExtension(name);
  const type =
    source.mimeType?.toLowerCase() || MIME_TYPE_BY_EXTENSION[extension] || '';

  if (
    !source.uri ||
    !name ||
    !ALLOWED_EXTENSIONS.has(extension) ||
    !ALLOWED_MIME_TYPES.has(type)
  ) {
    throw new Error(BETA_FEEDBACK_IMAGE_TYPE_ERROR);
  }

  const size = await getImageSize(source);

  if (size > MAX_BETA_FEEDBACK_IMAGE_BYTES) {
    throw new Error(BETA_FEEDBACK_IMAGE_SIZE_ERROR);
  }

  return {
    uri: source.uri,
    name,
    type,
    size,
  };
};
