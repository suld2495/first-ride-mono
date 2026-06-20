import { render } from '@testing-library/react-native';

import Checkbox from '../../../components/ui/checkbox';
import AppTamaguiProvider from '../../../components/ui/tamagui-provider';
import { baseFoundation, palette } from '../../../theme/tokens';

jest.mock('react-native-bouncy-checkbox', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ({
      ImageComponent,
      iconComponent,
      iconStyle,
      innerIconStyle,
      isChecked,
      size,
      text,
      textContainerStyle,
      textStyle,
      unFillColor,
    }: {
      ImageComponent?: unknown;
      iconComponent?: unknown;
      iconStyle?: { borderRadius?: number };
      innerIconStyle?: { borderColor?: string; borderRadius?: number };
      isChecked?: boolean;
      size: number;
      text?: string;
      textContainerStyle?: { justifyContent?: string; marginLeft?: number };
      textStyle?: {
        color?: string;
        fontSize?: number;
        fontWeight?: string;
        lineHeight?: number;
        textDecorationLine?: string;
      };
      unFillColor?: string;
    }) =>
      React.createElement(View, {
        testID: 'bouncy-checkbox',
        ImageComponent,
        iconComponent,
        iconStyle,
        innerIconStyle,
        isChecked,
        size,
        text,
        textContainerStyle,
        textStyle,
        unFillColor,
      }),
  };
});

describe('Checkbox', () => {
  it.each([
    ['xs', 14],
    ['md', 18],
    ['lg', 24],
  ] as const)('%s size를 숫자 크기로 변환해 전달한다', (size, expected) => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox size={size} onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.size).toBe(expected);
  });

  it('size를 지정하지 않으면 md 크기를 사용한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.size).toBe(18);
  });

  it('기본 체크박스는 네모 형태와 흰 배경, 회색 테두리를 사용한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.unFillColor).toBe(
      palette.white,
    );
    expect(getByTestId('bouncy-checkbox').props.iconStyle).toEqual({
      borderRadius: 5,
    });
    expect(getByTestId('bouncy-checkbox').props.innerIconStyle).toEqual({
      borderColor: palette.theme.gray[5],
      borderRadius: 5,
    });
  });

  it('borderRadius prop을 체크박스 외곽과 내부 아이콘에만 전달한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox borderRadius={4} onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.iconStyle).toEqual({
      borderRadius: 4,
    });
    expect(getByTestId('bouncy-checkbox').props.innerIconStyle).toEqual({
      borderColor: palette.theme.gray[5],
      borderRadius: 4,
    });
  });

  it('text prop을 체크박스에 전달한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox text="루틴 숨김" onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.text).toBe('루틴 숨김');
  });

  it('isChecked prop을 체크박스에 전달한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox isChecked={true} onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.isChecked).toBe(true);
  });

  it('체크되어도 기본 라벨 취소선은 표시하지 않는다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox isChecked={true} text="루틴 숨김" onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.textStyle).toEqual(
      expect.objectContaining({
        textDecorationLine: 'none',
      }),
    );
  });

  it('strikeThroughOnChecked 옵션을 켜면 체크 라벨 취소선을 허용한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox
          isChecked={true}
          strikeThroughOnChecked={true}
          text="루틴 숨김"
          onPress={jest.fn()}
        />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.textStyle).not.toHaveProperty(
      'textDecorationLine',
    );
  });

  it('md size 라벨은 gray90 컬러와 body2 semibold 스타일을 사용한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox size="md" text="루틴 숨김" onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.textStyle).toEqual(
      expect.objectContaining({
        color: palette.theme.gray[90],
        fontSize: baseFoundation.typography.size.body2,
        fontWeight: baseFoundation.typography.weight.semibold,
        lineHeight: 18,
      }),
    );
    expect(getByTestId('bouncy-checkbox').props.textContainerStyle).toEqual(
      expect.objectContaining({
        justifyContent: 'center',
        marginLeft: 7,
      }),
    );
  });

  it('false 상태에서도 보이는 기본 체크 SVG 아이콘을 전달한다', () => {
    const { getByTestId } = render(
      <AppTamaguiProvider>
        <Checkbox onPress={jest.fn()} />
      </AppTamaguiProvider>,
    );

    expect(getByTestId('bouncy-checkbox').props.iconComponent).toBeDefined();
    expect(getByTestId('bouncy-checkbox').props.ImageComponent).toBeUndefined();
  });
});
