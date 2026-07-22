import appConfig from '../../app.config';

describe('마이크 권한 설정', () => {
  it('이미지 선택기는 사진과 카메라만 사용하고 마이크 권한을 차단한다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);
    const imagePickerPlugin = config.plugins?.find(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'expo-image-picker',
    );

    expect(imagePickerPlugin).toEqual([
      'expo-image-picker',
      expect.objectContaining({
        photosPermission: expect.any(String),
        cameraPermission: expect.any(String),
        microphonePermission: false,
      }),
    ]);
  });

  it('iOS 앱 설정에 마이크 사용 설명을 직접 선언하지 않는다', () => {
    const config = appConfig({
      config: {},
    } as Parameters<typeof appConfig>[0]);

    expect(config.ios?.infoPlist).not.toHaveProperty(
      'NSMicrophoneUsageDescription',
    );
  });
});
