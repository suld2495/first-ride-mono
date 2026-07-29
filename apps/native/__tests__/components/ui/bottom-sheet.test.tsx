jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

import { act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { State } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';

import BottomSheet from '@/components/ui/bottom-sheet/bottom-sheet';
import { BOTTOM_SHEET_DISMISS_DISTANCE } from '@/components/ui/bottom-sheet/bottom-sheet-gesture';
import BottomSheetHeader from '@/components/ui/bottom-sheet/bottom-sheet-header';

import { render } from '../../setup/test-utils';

const fireHandleDrag = (translationY: number) => {
  act(() => {
    fireGestureHandler(getByGestureTestId('bottom-sheet-drag-gesture'), [
      { state: State.BEGAN, translationY: 0, velocityY: 0 },
      { state: State.ACTIVE, translationY, velocityY: 0 },
      { state: State.END, translationY, velocityY: 0 },
    ]);
  });
};

const renderBottomSheet = (
  onRequestClose: jest.Mock,
  visible = true,
  onClosed?: jest.Mock,
) =>
  render(
    <BottomSheet
      visible={visible}
      label="테스트"
      onRequestClose={onRequestClose}
      onClosed={onClosed}
    >
      <BottomSheetHeader>
        <Text>내용</Text>
      </BottomSheetHeader>
    </BottomSheet>,
  );

describe('BottomSheet drag handle', () => {
  it('핸들을 조금 내렸다 놓으면 닫기 요청을 보내지 않는다', () => {
    const onRequestClose = jest.fn();

    renderBottomSheet(onRequestClose);

    fireHandleDrag(BOTTOM_SHEET_DISMISS_DISTANCE - 1);

    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('핸들을 기준 거리 아래로 내렸다 놓으면 닫기 요청을 보낸다', () => {
    const onRequestClose = jest.fn();

    renderBottomSheet(onRequestClose);

    fireHandleDrag(BOTTOM_SHEET_DISMISS_DISTANCE);
    fireHandleDrag(BOTTOM_SHEET_DISMISS_DISTANCE);

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('드래그가 취소되면 닫기 요청을 보내지 않고 원래 위치로 복귀한다', () => {
    const onRequestClose = jest.fn();

    renderBottomSheet(onRequestClose);

    act(() => {
      fireGestureHandler(getByGestureTestId('bottom-sheet-drag-gesture'), [
        { state: State.BEGAN, translationY: 0, velocityY: 0 },
        {
          state: State.ACTIVE,
          translationY: BOTTOM_SHEET_DISMISS_DISTANCE,
          velocityY: 0,
        },
        {
          state: State.CANCELLED,
          translationY: BOTTOM_SHEET_DISMISS_DISTANCE,
          velocityY: 0,
        },
      ]);
    });

    expect(onRequestClose).not.toHaveBeenCalled();
  });

  it('visible이 false가 되면 닫힘 애니메이션 후 onClosed를 호출한다', () => {
    jest.useFakeTimers();
    const onRequestClose = jest.fn();
    const onClosed = jest.fn();
    const screen = renderBottomSheet(onRequestClose, true, onClosed);

    screen.rerender(
      <BottomSheet
        visible={false}
        label="테스트"
        onRequestClose={onRequestClose}
        onClosed={onClosed}
      >
        <BottomSheetHeader>
          <Text>내용</Text>
        </BottomSheetHeader>
      </BottomSheet>,
    );

    expect(screen.queryByText('내용')).not.toBeOnTheScreen();

    act(() => {
      jest.runAllTimers();
    });

    expect(onClosed).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('바텀 시트 밖에서도 Header의 핸들 디자인을 렌더링한다', () => {
    const screen = render(
      <BottomSheetHeader>
        <Text>내용</Text>
      </BottomSheetHeader>,
    );

    expect(screen.getByTestId('bottom-sheet-drag-handle')).toBeOnTheScreen();
  });
});
