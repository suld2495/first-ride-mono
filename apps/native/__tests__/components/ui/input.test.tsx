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
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <FormattedInput />
      </AppTamaguiProvider>,
    );
    const input = getByTestId('formatted-input');

    expect(input.props.value).toBeUndefined();
    expect(input.props.defaultValue).toBe('999');
    expect(input.props.caretHidden).toBe(true);
    expect(input).toHaveStyle({ color: 'transparent' });

    fireEvent.changeText(input, '1000');

    expect(setNativeProps).toHaveBeenCalledWith({ text: '1,000' });
    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('1000');
    expect(getByTestId('formatted-input-display').props.value).toBe('1,000');

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
