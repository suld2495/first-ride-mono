import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const patch = readFileSync(
  resolve(__dirname, '../../../../patches/react-native@0.81.5.patch'),
  'utf8',
);

describe('React Native 공백 입력 필터', () => {
  it('소스 빌드용 Hermes 컴파일러는 배포 최적화 설정으로 생성한다', () => {
    expect(patch).toContain('+              "-DCMAKE_BUILD_TYPE=Release",');
  });

  it('iOS에서 삭제 입력은 허용하고 실제 문자 입력에만 공백 필터를 적용한다', () => {
    expect(patch).toContain(
      '+  if (_disallowWhitespace && text.length > 0) {',
    );
    expect(patch).toContain(
      '+  if (props.disallowWhitespace && text.length > 0) {',
    );
    expect(patch).toContain(
      '+  @ReactProp(name = "disallowWhitespace", defaultBoolean = false)',
    );
  });
});
