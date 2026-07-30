import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import {
  AutocompleteInput,
  resolveAutocompleteDropdownLayout,
} from '../../../components/ui/autocomplete-input';
import AppTamaguiProvider from '../../../components/ui/tamagui-provider';
import { useColorSchemeStore } from '../../../store/color-scheme.store';
import { appThemes } from '../../../theme/themes';
import { baseFoundation, palette } from '../../../theme/tokens';

describe('AutocompleteInput', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    useColorSchemeStore.getState().setColorScheme('dark');
  });

  it('드롭다운 높이만큼 아래 공간이 있으면 아래 배치를 선택한다', () => {
    expect(
      resolveAutocompleteDropdownLayout({
        anchorY: 300,
        anchorHeight: 44,
        dropdownHeight: 176,
        dropdownMaxHeight: 200,
        viewportBottom: 800,
      }),
    ).toEqual({
      placement: 'below',
      maxHeight: 200,
    });
  });

  it('드롭다운 높이만큼 아래 공간이 없으면 위 배치를 선택한다', () => {
    expect(
      resolveAutocompleteDropdownLayout({
        anchorY: 650,
        anchorHeight: 44,
        dropdownHeight: 176,
        dropdownMaxHeight: 200,
        viewportBottom: 800,
      }),
    ).toEqual({
      placement: 'above',
      maxHeight: 200,
    });
  });

  it('키보드 상단까지의 아래 공간이 부족하면 위 배치를 선택한다', () => {
    expect(
      resolveAutocompleteDropdownLayout({
        anchorY: 500,
        anchorHeight: 44,
        dropdownHeight: 176,
        dropdownMaxHeight: 200,
        viewportBottom: 620,
      }),
    ).toEqual({
      placement: 'above',
      maxHeight: 200,
    });
  });

  it('위쪽 공간도 부족하면 드롭다운 높이를 위쪽 여백으로 제한한다', () => {
    expect(
      resolveAutocompleteDropdownLayout({
        anchorY: 120,
        anchorHeight: 44,
        dropdownHeight: 176,
        dropdownMaxHeight: 200,
        viewportBottom: 250,
      }),
    ).toEqual({
      placement: 'above',
      maxHeight: 116,
    });
  });

  it('옵션의 실제 높이를 드롭다운 전체 높이 계산 단위와 일치시킨다', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <AppTamaguiProvider>
        <AutocompleteInput
          placeholder="메이트를 지정해주세요."
          items={[{ label: 'yunji12345', value: 'yunji12345' }]}
        />
      </AppTamaguiProvider>,
    );

    fireEvent(getByPlaceholderText('메이트를 지정해주세요.'), 'focus');

    expect(
      StyleSheet.flatten(getByTestId('autocomplete-option').props.style).height,
    ).toBe(baseFoundation.dimension.x48);
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
