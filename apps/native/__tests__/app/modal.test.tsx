import { useFriendProfileQuery } from '@repo/shared/hooks/useFriend';
import { StyleSheet, View } from 'react-native';

import ModalScreen from '../../app/modal';
import { appThemes } from '../../theme/themes';
import { render } from '../setup/test-utils';

declare const mockReplace: jest.Mock;
declare const mockPush: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockRoutineStore: {
  setRoutineId: jest.Mock;
};

let mockModalOptions: Record<string, unknown> = {};
const createMockUseModalResult = (type: unknown) => {
  if (type === 'unknown-modal') {
    throw new Error('존재하지 않은 모달입니다.');
  }

  return ['테스트 모달', () => null, mockModalOptions];
};
const mockUseModal = jest.fn(createMockUseModalResult);

jest.mock('@repo/shared/hooks/useFriend', () => ({
  useFriendProfileQuery: jest.fn(),
}));

jest.mock('@/components/modal/modal-header', () => {
  const { Text } = require('react-native');

  function ModalHeaderMock({ title }: { title: string }) {
    return <Text>{title}</Text>;
  }

  return ModalHeaderMock;
});

jest.mock('@/hooks/useModal', () => ({
  useModal: (type: unknown) => mockUseModal(type),
}));

jest.mock('@/types/modal', () => ({
  normalizeModalType: (type: unknown) => {
    if (type === 'routine-edit') {
      return 'routine-update';
    }

    if (type === 'unknown-modal') {
      return null;
    }

    return type;
  },
}));

describe('ModalScreen', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockSearchParams)) {
      delete mockSearchParams[key];
    }
    mockSearchParams.type = 'routine-add';
    mockModalOptions = {};
    mockReplace.mockClear();
    mockPush.mockClear();
    mockUseModal.mockClear();
    mockUseModal.mockImplementation(createMockUseModalResult);
    jest.mocked(useFriendProfileQuery).mockReset();
    jest.mocked(useFriendProfileQuery).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useFriendProfileQuery>);
    mockRoutineStore.setRoutineId.mockClear();
  });

  it('친구 루틴 모달의 상단 full-bleed 배경에도 evolutionCount 색상을 적용한다', () => {
    mockSearchParams.type = 'friend-routines';
    mockSearchParams.friendId = '42';
    mockModalOptions = { fullBleedBackground: true };
    jest.mocked(useFriendProfileQuery).mockReturnValue({
      data: {
        characterCode: 'MAGE_INTERMEDIATE',
        evolutionCount: 1,
        job: '마법사',
      },
    } as ReturnType<typeof useFriendProfileQuery>);

    const screen = render(<ModalScreen />);
    const expectedBackgroundColor =
      appThemes.red.colors.brand.routineEvolutionBackground.stage1;
    const matchingViews = screen
      .UNSAFE_getAllByType(View)
      .filter(
        (node) =>
          StyleSheet.flatten(node.props.style)?.backgroundColor ===
          expectedBackgroundColor,
      );

    expect(matchingViews).toHaveLength(1);
  });

  it('does not add extra top padding above the shared page header', () => {
    const { getByTestId } = render(<ModalScreen />);

    const containerStyle = StyleSheet.flatten(
      getByTestId('modal-screen-container').props.style,
    );

    expect(containerStyle).toEqual(
      expect.objectContaining({
        flex: 1,
      }),
    );
    expect(containerStyle.paddingTop).toBeUndefined();
  });

  it('slides the modal container out when the modal closes', () => {
    const { getByTestId } = render(<ModalScreen />);

    expect(getByTestId('modal-screen-container').props.exiting).toBeDefined();
  });

  it('keeps the gap between the modal header and body at 0px', () => {
    const { getByTestId } = render(<ModalScreen />);

    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.marginTop).toBe(0);
    expect(contentStyle.paddingTop).toBe(0);
  });

  it('does not round the modal content corners', () => {
    const { getByTestId } = render(<ModalScreen />);

    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.borderRadius).toBeUndefined();
  });

  it('uses 24px as the default horizontal content padding', () => {
    const { getByTestId } = render(<ModalScreen />);

    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.paddingHorizontal).toBe(24);
  });

  it('allows the horizontal content padding to be configured by modal options', () => {
    mockModalOptions = {
      contentPaddingHorizontal: 20,
    };

    const { getByTestId } = render(<ModalScreen />);

    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.paddingHorizontal).toBe(20);
  });

  it('allows the horizontal content padding to be removed with a 0px option', () => {
    mockModalOptions = {
      contentPaddingHorizontal: 0,
    };

    const { getByTestId } = render(<ModalScreen />);
    const contentStyle = StyleSheet.flatten(
      getByTestId('modal-screen-content').props.style,
    );

    expect(contentStyle.paddingHorizontal).toBe(0);
  });

  it('stores routineId from shared certification request links', () => {
    mockSearchParams.type = 'request';
    mockSearchParams.routineId = '42';

    render(<ModalScreen />);

    expect(mockRoutineStore.setRoutineId).toHaveBeenCalledWith(42);
  });

  it('normalizes the legacy routine-edit modal type to routine-update', () => {
    mockSearchParams.type = 'routine-edit';

    render(<ModalScreen />);

    expect(mockUseModal).toHaveBeenCalledWith('routine-update');
  });

  it('redirects without rendering when modal type is unknown', () => {
    mockSearchParams.type = 'unknown-modal';

    const { queryByTestId } = render(<ModalScreen />);

    expect(mockUseModal).toHaveBeenCalledWith('routine-add');
    expect(queryByTestId('modal-screen-container')).not.toBeOnTheScreen();
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/(afterLogin)/(routine)');
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
