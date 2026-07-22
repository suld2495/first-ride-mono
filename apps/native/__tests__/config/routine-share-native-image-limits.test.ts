import fs from 'fs';
import path from 'path';

const NATIVE_ROOT = path.resolve(__dirname, '../..');
const androidPluginSource = fs.readFileSync(
  path.join(NATIVE_ROOT, 'plugins/with-routine-share-android.js'),
  'utf8',
);
const iosShareSource = fs.readFileSync(
  path.join(NATIVE_ROOT, 'targets/routine-share/ShareViewController.swift'),
  'utf8',
);

describe('공유 확장 네이티브 이미지 입력 제한', () => {
  it('Android는 전체 스트림을 메모리에 올리지 않고 10MB에서 복사를 중단한다', () => {
    expect(androidPluginSource).not.toContain('.readBytes()');
    expect(androidPluginSource).toContain(
      'MAX_SHARED_IMAGE_BYTES = 10L * 1024 * 1024',
    );
    expect(androidPluginSource).toContain('STREAM_BUFFER_SIZE = 64 * 1024');
    expect(androidPluginSource).toContain('ByteArray(STREAM_BUFFER_SIZE)');
    expect(androidPluginSource).toContain(
      'totalBytes > MAX_SHARED_IMAGE_BYTES',
    );
    expect(androidPluginSource).toContain('partialFile.delete()');
  });

  it('Android는 실제 이미지 형식과 픽셀 수를 검사하고 안전한 크기로 디코딩한다', () => {
    expect(androidPluginSource).toContain('ALLOWED_IMAGE_MIME_TYPES');
    expect(androidPluginSource).toContain('contentResolver.getType(uri)');
    expect(androidPluginSource).toContain('inJustDecodeBounds = true');
    expect(androidPluginSource).toContain(
      'MAX_SHARED_IMAGE_PIXELS / sourceHeight',
    );
    expect(androidPluginSource).toContain('calculateInSampleSize');
    expect(androidPluginSource).toContain('MAX_SHARED_IMAGE_DIMENSION = 4096');
    expect(androidPluginSource).toContain('.put("width"');
    expect(androidPluginSource).toContain('.put("height"');
  });

  it('Android는 손상 파일과 ContentProvider 오류를 사용자 오류로 처리한다', () => {
    expect(androidPluginSource).toContain('catch (_: Exception)');
    expect(androidPluginSource).toContain('showInvalidImageMessage()');
    expect(androidPluginSource).toContain('Toast.makeText');
    expect(androidPluginSource).toContain(
      'sessionDirectory.deleteRecursively()',
    );
  });

  it('iOS는 파일 표현과 메타데이터를 사용해 전체 Data 적재를 피한다', () => {
    expect(iosShareSource).not.toContain('Data(contentsOf:');
    expect(iosShareSource).toContain('loadFileRepresentation');
    expect(iosShareSource).toContain(
      'maximumSharedImageBytes = 10 * 1024 * 1024',
    );
    expect(iosShareSource).toContain('CGImageSourceCreateWithURL');
    expect(iosShareSource).toContain('kCGImageSourceShouldCache: false');
  });

  it('iOS는 실제 형식과 픽셀 수를 검사한 뒤 4096px 이하 JPEG로 저장한다', () => {
    expect(iosShareSource).toContain('allowedImageTypeIdentifiers');
    expect(iosShareSource).toContain('CGImageSourceGetType');
    expect(iosShareSource).toContain(
      'maximumSharedImagePixels: Int64 = 60_000_000',
    );
    expect(iosShareSource).toContain('kCGImagePropertyPixelWidth');
    expect(iosShareSource).toContain('kCGImagePropertyPixelHeight');
    expect(iosShareSource).toContain(
      'kCGImageSourceThumbnailMaxPixelSize: 4096',
    );
    expect(iosShareSource).toContain('CGImageSourceCreateThumbnailAtIndex');
    expect(iosShareSource).toContain('CGImageDestinationCreateWithURL');
  });

  it('iOS는 처리 실패 파일을 삭제하고 사용자에게 안전한 오류를 표시한다', () => {
    expect(iosShareSource).toContain('removeItem(at: outputURL)');
    expect(iosShareSource).toContain('LocalizedError');
    expect(iosShareSource).toContain('지원하지 않거나 너무 큰 이미지입니다.');
  });
});
