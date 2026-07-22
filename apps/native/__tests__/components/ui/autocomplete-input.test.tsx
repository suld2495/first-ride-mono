import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { AutocompleteInput } from '../../../components/ui/autocomplete-input';
import AppTamaguiProvider from '../../../components/ui/tamagui-provider';
import { useColorSchemeStore } from '../../../store/color-scheme.store';
import { appThemes } from '../../../theme/themes';
import { baseFoundation, palette } from '../../../theme/tokens';

describe('AutocompleteInput', () => {
  afterEach(() => {
    useColorSchemeStore.getState().setColorScheme('dark');
  });

  it('컬러 테마에서도 드롭다운 옵션 텍스트가 배경과 대비되게 보인다', () => {
    useColorSchemeStore.getState().setColorScheme('blue');

    const { getByPlaceholderText, getByTestId, getByText } = render(
      <AppTamaguiProvider>
        <AutocompleteInput
          placeholder="메이트를 지정해주세요."
          items={[{ label: 'yunji12345', value: 'yunji12345' }]}
        />
      </AppTamaguiProvider>,
    );

    fireEvent(getByPlaceholderText('메이트를 지정해주세요.'), 'focus');

    const optionStyle = StyleSheet.flatten(
      getByTestId('autocomplete-option').props.style,
    );
    expect(optionStyle.backgroundColor).toBe(
      appThemes.blue.colors.background.input,
    );
    expect(getByText('yunji12345')).toHaveStyle({
      color: appThemes.blue.colors.text.input,
    });
  });

  it('옵션 divider는 항목 사이에만 표시한다', () => {
    const { getByPlaceholderText, getAllByTestId } = render(
      <AppTamaguiProvider>
        <AutocompleteInput
          placeholder="메이트를 지정해주세요."
          items={[
            { label: 'yunji12345', value: 'yunji12345' },
            { label: 'hy', value: 'hy' },
            { label: 'Fff', value: 'Fff' },
          ]}
        />
      </AppTamaguiProvider>,
    );

    fireEvent(getByPlaceholderText('메이트를 지정해주세요.'), 'focus');

    const optionStyles = getAllByTestId('autocomplete-option').map((option) =>
      StyleSheet.flatten(option.props.style),
    );

    expect(optionStyles[0].borderBottomWidth).toBe(1);
    expect(optionStyles[0].borderBottomColor).toBe(palette.theme.gray[5]);
    expect(optionStyles[0].borderTopLeftRadius).toBe(
      baseFoundation.dimension.x8,
    );
    expect(optionStyles[0].borderTopRightRadius).toBe(
      baseFoundation.dimension.x8,
    );
    expect(optionStyles[1].borderBottomWidth).toBe(1);
    expect(optionStyles[1].borderBottomColor).toBe(palette.theme.gray[5]);
    expect(optionStyles[1].borderTopLeftRadius).toBe(0);
    expect(optionStyles[1].borderBottomLeftRadius).toBe(0);
    expect(optionStyles[2].borderBottomWidth).toBe(0);
    expect(optionStyles[2].borderBottomLeftRadius).toBe(
      baseFoundation.dimension.x8,
    );
    expect(optionStyles[2].borderBottomRightRadius).toBe(
      baseFoundation.dimension.x8,
    );
  });
});
