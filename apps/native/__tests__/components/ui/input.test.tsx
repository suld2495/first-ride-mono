import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { TextInput } from 'react-native';

import { Input } from '../../../components/ui/input';
import AppTamaguiProvider from '../../../components/ui/tamagui-provider';

const formatNumber = (text: string) => {
  const digits = text.replace(/[^0-9]/g, '');

  return Number(digits).toLocaleString('ko-KR');
};

describe('Input', () => {
  it('원래 입력값은 숨기고 포맷된 문자열만 즉시 표시한다', () => {
    const setNativeProps = jest.spyOn(TextInput.prototype, 'setNativeProps');
    const onChangeText = jest.fn();
    const FormattedInput = () => {
      const [value, setValue] = useState('999');

      return (
        <Input
          testID="formatted-input"
          value={value}
          displayFormatter={formatNumber}
          displayValueTestID="formatted-input-display"
          onChangeText={(text) => {
            onChangeText(text);
            setValue(text);
          }}
        />
      );
    };
    const { getByTestId, queryByTestId } = render(
      <AppTamaguiProvider>
        <FormattedInput />
      </AppTamaguiProvider>,
    );
    const input = getByTestId('formatted-input');

    expect(input.props.value).toBeUndefined();
    expect(input.props.defaultValue).toBe('999');
    expect(input.props.caretHidden).not.toBe(true);
    expect(input.props.selectionColor).toBeDefined();
    expect(input).toHaveStyle({ color: 'transparent' });

    fireEvent(input, 'focus');

    expect(queryByTestId('formatted-input-display-cursor')).toBeNull();

    fireEvent(input, 'selectionChange', {
      nativeEvent: { selection: { start: 3, end: 3 } },
    });

    fireEvent.changeText(input, '1000');

    expect(setNativeProps).toHaveBeenCalledWith({ text: '1,000' });
    expect(setNativeProps).toHaveBeenCalledWith({
      text: '1,000',
      selection: { start: 5, end: 5 },
    });
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('1000');
    expect(getByTestId('formatted-input-display').props.value).toBe('1,000');

    fireEvent(input, 'blur');

    expect(queryByTestId('formatted-input-display-cursor')).toBeNull();

    setNativeProps.mockRestore();
  });

  it('중간 위치 입력 후 실제 selection을 포맷된 숫자 위치로 유지한다', () => {
    const setNativeProps = jest.spyOn(TextInput.prototype, 'setNativeProps');
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Input
          testID="formatted-input"
          value="12345"
          displayFormatter={formatNumber}
        />
      </AppTamaguiProvider>,
    );
    const input = getByTestId('formatted-input');

    expect(input.props.defaultValue).toBe('12,345');

    fireEvent(input, 'selectionChange', {
      nativeEvent: { selection: { start: 2, end: 2 } },
    });
    fireEvent.changeText(input, '129,345');

    expect(setNativeProps).toHaveBeenCalledWith({
      text: '129,345',
      selection: { start: 3, end: 3 },
    });

    setNativeProps.mockRestore();
  });

  it('change 이벤트는 onChangeText를 중복 호출하지 않는다', () => {
    const onChange = jest.fn();
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Input testID="input" onChange={onChange} onChangeText={onChangeText} />
      </AppTamaguiProvider>,
    );
    const input = getByTestId('input');

    fireEvent(input, 'change', { nativeEvent: { text: '1' } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChangeText).not.toHaveBeenCalled();
  });
});
