import { StyleSheet as ReactNativeStyleSheet } from 'react-native';

import AuthPage from '@/components/auth/auth-page';
import ThemeView from '@/components/ui/theme-view';
import { palette } from '@/theme/tokens';

import { render } from '../../setup/test-utils';

describe('AuthPage', () => {
  it('헤더 제목을 공통 페이지 헤더 제목 색(gray 90)으로 렌더링한다', () => {
    const { getByText } = render(
      <AuthPage>
        <AuthPage.Header title="로그인" />
      </AuthPage>,
    );

    const titleStyle = ReactNativeStyleSheet.flatten(
      getByText('로그인').props.style,
    );

    expect(titleStyle).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
        textAlign: 'center',
      }),
    );
  });

  it('넓은 화면에서도 인증 콘텐츠를 모바일 화면 폭으로 제한한다', () => {
    const { UNSAFE_getAllByType } = render(
      <AuthPage>
        <AuthPage.Body>내용</AuthPage.Body>
      </AuthPage>,
    );
    const [, content] = UNSAFE_getAllByType(ThemeView);
    const contentStyle = ReactNativeStyleSheet.flatten(content.props.style);

    expect(contentStyle).toEqual(
      expect.objectContaining({
        alignSelf: 'center',
        maxWidth: 430,
        width: '100%',
      }),
    );
  });
});
