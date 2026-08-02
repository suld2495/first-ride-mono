import { fireEvent, render, within } from '@testing-library/react-native';
import { Keyboard, StyleSheet, TextInput } from 'react-native';

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

  it('옵션 이미지가 있으면 24 크기의 원형 캐릭터와 이름을 8 간격으로 표시한다', () => {
    const characterImageSource = {
      uri: 'https://example.com/friend-character.png',
    };
    const { getByPlaceholderText, getByTestId } = render(
      <AppTamaguiProvider>
        <AutocompleteInput
          placeholder="친구를 선택하세요"
          items={[
            {
              label: 'friend1',
              value: 'friend1',
              imageSource: characterImageSource,
            },
          ]}
        />
      </AppTamaguiProvider>,
    );

    fireEvent(getByPlaceholderText('친구를 선택하세요'), 'focus');

    expect(getByTestId('autocomplete-option-content-friend1')).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      gap: baseFoundation.spacing[2],
    });
    expect(getByTestId('autocomplete-option-avatar-friend1')).toHaveStyle({
      width: baseFoundation.dimension.x24,
      height: baseFoundation.dimension.x24,
      borderRadius: baseFoundation.radii.round,
      overflow: 'hidden',
      backgroundColor: palette.theme.gray[5],
    });
    expect(
      getByTestId('autocomplete-option-image-friend1').props.source,
    ).toEqual(characterImageSource);
  });

  it('버튼 모드에서 기존 입력창을 직접 편집하지 않고 눌러서 옵션을 연다', () => {
    const { getByLabelText, getByPlaceholderText, getByText } = render(
      <AppTamaguiProvider>
        <AutocompleteInput
          interactionMode="button"
          placeholder="친구를 선택하세요"
          items={[{ label: 'friend1', value: 'friend1' }]}
        />
      </AppTamaguiProvider>,
    );

    const button = getByLabelText('친구를 선택하세요');

    expect(button.props.accessibilityRole).toBe('button');
    expect(getByPlaceholderText('친구를 선택하세요').props.editable).toBe(
      false,
    );

    fireEvent.press(button);

    expect(getByText('friend1')).toBeOnTheScreen();
  });

  it('버튼 드롭다운의 첫 번째 항목에 입력창을 표시하고 텍스트 변경을 전달한다', () => {
    const onChangeText = jest.fn();
    const { getByLabelText, getByPlaceholderText, getByTestId } = render(
      <AppTamaguiProvider>
        <AutocompleteInput
          interactionMode="button"
          placeholder="친구를 선택하세요"
          dropdownInput={{
            value: '',
            placeholder: '친구를 검색하세요',
            onChangeText,
          }}
          items={[{ label: 'friend1', value: 'friend1' }]}
        />
      </AppTamaguiProvider>,
    );

    fireEvent.press(getByLabelText('친구를 선택하세요'));

    const dropdownScroll = getByTestId('autocomplete-dropdown-scroll');
    const dropdownInput = getByPlaceholderText('친구를 검색하세요');
    const dropdownItems = within(dropdownScroll).getAllByTestId(
      /^(autocomplete-dropdown-input-item|autocomplete-option)$/,
    );

    expect(dropdownItems[0].props.testID).toBe(
      'autocomplete-dropdown-input-item',
    );

    fireEvent.changeText(dropdownInput, 'friend2');

    expect(onChangeText).toHaveBeenCalledWith('friend2');
  });

  it('선택된 옵션 우측 12 여백에 현재 테마 50 색상의 체크 아이콘을 표시한다', () => {
    useColorSchemeStore.getState().setColorScheme('green');

    const { getAllByTestId, getByPlaceholderText, getByTestId, queryByTestId } =
      render(
        <AppTamaguiProvider>
          <AutocompleteInput
            placeholder="친구를 선택하세요"
            value="friend2"
            items={[
              { label: 'friend1', value: 'friend1' },
              { label: 'friend2', value: 'friend2' },
            ]}
          />
        </AppTamaguiProvider>,
      );

    fireEvent(getByPlaceholderText('친구를 선택하세요'), 'focus');

    expect(queryByTestId('autocomplete-selected-icon-friend1')).toBeNull();
    expect(getByTestId('autocomplete-selected-icon-friend2').props.color).toBe(
      palette.theme.green[50],
    );
    expect(
      StyleSheet.flatten(getAllByTestId('autocomplete-option')[1].props.style)
        .paddingRight,
    ).toBe(baseFoundation.spacing[3]);
  });

  it('옵션을 선택하면 입력 포커스와 키보드를 해제한다', () => {
    const dismissKeyboard = jest.spyOn(Keyboard, 'dismiss');
    const blurInput = jest.spyOn(TextInput.prototype, 'blur');
    const onSelectItem = jest.fn();
    const { getByPlaceholderText, getByText, queryByTestId } = render(
      <AppTamaguiProvider>
        <AutocompleteInput
          placeholder="친구를 선택하세요"
          items={[{ label: 'friend1', value: 'friend1' }]}
          onSelectItem={onSelectItem}
        />
      </AppTamaguiProvider>,
    );

    fireEvent(getByPlaceholderText('친구를 선택하세요'), 'focus');
    fireEvent.press(getByText('friend1'));

    expect(onSelectItem).toHaveBeenCalledWith({
      label: 'friend1',
      value: 'friend1',
    });
    expect(blurInput).toHaveBeenCalledTimes(1);
    expect(dismissKeyboard).toHaveBeenCalledTimes(1);
    expect(queryByTestId('autocomplete-dropdown')).not.toBeOnTheScreen();
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
