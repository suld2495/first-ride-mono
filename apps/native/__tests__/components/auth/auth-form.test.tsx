import { StyleSheet as ReactNativeStyleSheet } from 'react-native';

import AuthForm from '@/components/auth/auth-form';
import { palette } from '@/theme/tokens';

import { render } from '../../setup/test-utils';

describe('AuthForm', () => {
  it('제목을 공통 페이지 헤더 제목 색(gray 90)으로 렌더링한다', () => {
    const { getByText } = render(
      <AuthForm title="추가 정보 입력">{null}</AuthForm>,
    );

    const titleStyle = ReactNativeStyleSheet.flatten(
      getByText('추가 정보 입력').props.style,
    );

    expect(titleStyle).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
        textAlign: 'center',
      }),
    );
  });
});
