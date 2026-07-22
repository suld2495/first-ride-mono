import packageJson from '../../package.json';

describe('Expo Doctor configuration', () => {
  it('검증된 React Native Directory 메타데이터 경고만 제외한다', () => {
    expect(
      packageJson.expo.doctor.reactNativeDirectoryCheck.exclude,
    ).toEqual([
      'react-native-bouncy-checkbox',
      'react-native-keyboard-aware-scroll-view',
      'react-native-markdown-display',
    ]);
  });
});
