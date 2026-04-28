import TabsIndex from '../../app/(tabs)/index';
import { render } from '../setup/auth-test-utils';

describe('탭 기본 진입 페이지', () => {
  it('루틴 탭으로 이동한다', () => {
    const { getByTestId } = render(<TabsIndex />);

    expect(getByTestId('redirect')).toHaveProp(
      'href',
      '/(tabs)/(afterLogin)/(routine)',
    );
  });
});
