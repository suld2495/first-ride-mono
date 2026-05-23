import { render } from '@testing-library/react-native';
import Svg from 'react-native-svg';

import TabBarIcon, {
  type TabBarIconSvgProps,
} from '@/components/ui/tab-bar-icon';

const TestIcon = jest.fn(({ size }: TabBarIconSvgProps) => (
  <Svg
    testID="tab-bar-svg-icon"
    width={size}
    height={size}
    viewBox="0 0 20 20"
  />
));

describe('TabBarIcon', () => {
  it('passes the requested size and color to svg icons', () => {
    const { getByTestId } = render(
      <TabBarIcon icon={TestIcon} size={24} color="#123456" />,
    );

    expect(getByTestId('tab-bar-svg-icon')).toHaveProp('width', 24);
    expect(getByTestId('tab-bar-svg-icon')).toHaveProp('height', 24);
    expect(TestIcon.mock.calls[0][0]).toMatchObject({
      color: '#123456',
      size: 24,
    });
  });
});
