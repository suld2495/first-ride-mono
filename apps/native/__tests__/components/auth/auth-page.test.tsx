import { StyleSheet as ReactNativeStyleSheet } from 'react-native';

import AuthPage from '@/components/auth/auth-page';
import ThemeView from '@/components/ui/theme-view';

import { render } from '../../setup/test-utils';

describe('AuthPage', () => {
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
