import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Select } from '../../../components/ui/select';
import AppTamaguiProvider from '../../../components/ui/tamagui-provider';
import { baseFoundation } from '../../../theme/tokens';

describe('Select', () => {
  it('filled md Input과 같은 기본 필드 형태를 사용한다', () => {
    const { UNSAFE_getByType } = render(
      <AppTamaguiProvider>
        <Select
          value={undefined}
          items={[{ label: '옵션 1', value: 1 }]}
          onSelect={jest.fn()}
          placeholder="선택하세요"
          variant="filled"
          size="md"
        />
      </AppTamaguiProvider>,
    );

    const selectButton = UNSAFE_getByType(TouchableOpacity);
    const buttonStyle = StyleSheet.flatten(selectButton.props.style);

    expect(buttonStyle).toEqual(
      expect.objectContaining({
        height: baseFoundation.dimension.x44,
        paddingHorizontal: baseFoundation.spacing[3],
        borderWidth: 0,
      }),
    );
  });

  it('Input 계열 스타일 props를 필드와 텍스트에 전달한다', () => {
    const { UNSAFE_getByType, getByText } = render(
      <AppTamaguiProvider>
        <Select
          value={1}
          items={[{ label: '옵션 1', value: 1 }]}
          onSelect={jest.fn()}
          variant="underlined"
          size="lg"
          textStyle={{ textAlign: 'center' }}
        />
      </AppTamaguiProvider>,
    );

    const selectButton = UNSAFE_getByType(TouchableOpacity);
    const buttonStyle = StyleSheet.flatten(selectButton.props.style);

    expect(buttonStyle).toEqual(
      expect.objectContaining({
        height: baseFoundation.dimension.x56,
        borderWidth: 0,
        borderBottomWidth: 1,
      }),
    );
    expect(getByText('옵션 1')).toHaveStyle({
      fontSize: baseFoundation.typography.size.xl,
      textAlign: 'center',
    });
  });

  it('옵션 항목도 Select 본체와 같은 배경과 텍스트 스타일 계열을 사용한다', () => {
    const { UNSAFE_getAllByType, getAllByText, getByTestId } = render(
      <AppTamaguiProvider>
        <Select
          value={1}
          items={[{ label: '옵션 1', value: 1 }]}
          onSelect={jest.fn()}
          variant="filled"
        />
      </AppTamaguiProvider>,
    );

    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);

    const optionButton = UNSAFE_getAllByType(TouchableOpacity)[1];
    const dropdownStyle = StyleSheet.flatten(
      getByTestId('select-dropdown').props.style,
    );
    const fieldStyle = StyleSheet.flatten(
      UNSAFE_getAllByType(TouchableOpacity)[0].props.style,
    );
    const optionStyle = StyleSheet.flatten(optionButton.props.style);
    const [fieldText, optionText] = getAllByText('옵션 1');
    const fieldTextStyle = StyleSheet.flatten(fieldText.props.style);
    const optionTextStyle = StyleSheet.flatten(optionText.props.style);

    expect(dropdownStyle.borderWidth).toBe(0);
    expect(dropdownStyle.shadowOpacity).toBeUndefined();
    expect(optionStyle.backgroundColor).toBe(fieldStyle.backgroundColor);
    expect(optionStyle.borderWidth).toBe(0);
    expect(optionStyle.borderBottomWidth).toBe(0);
    expect(optionTextStyle.color).toBe(fieldTextStyle.color);
    expect(optionTextStyle.fontSize).toBe(fieldTextStyle.fontSize);
  });

  it('옵션 목록 높이를 제한해 영역 안에서 스크롤할 수 있게 한다', () => {
    const { UNSAFE_getAllByType, getByTestId } = render(
      <AppTamaguiProvider>
        <Select
          value={undefined}
          items={Array.from({ length: 7 }, (_, index) => ({
            label: `옵션 ${index + 1}`,
            value: index + 1,
          }))}
          onSelect={jest.fn()}
          dropdownMaxHeight={120}
        />
      </AppTamaguiProvider>,
    );

    fireEvent.press(UNSAFE_getAllByType(TouchableOpacity)[0]);

    expect(
      StyleSheet.flatten(getByTestId('select-dropdown').props.style),
    ).toEqual(
      expect.objectContaining({
        height: 120,
      }),
    );
  });
});
