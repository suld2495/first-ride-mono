import { render } from '@testing-library/react-native';

import AppTamaguiProvider from '../../../components/ui/tamagui-provider';
import { Typography } from '../../../components/ui/typography';

describe('Typography', () => {
  it('Tamagui provider 안에서 텍스트를 렌더링한다', () => {
    const { getByText } = render(
      <AppTamaguiProvider>
        <Typography variant="title" color="primary">
          테스트 타이포그래피
        </Typography>
      </AppTamaguiProvider>,
    );

    expect(getByText('테스트 타이포그래피')).toBeOnTheScreen();
  });
});
