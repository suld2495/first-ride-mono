import axiosInstance from '@repo/shared/api';
import * as routineHooks from '@repo/shared/hooks/useRoutine';
import { afterWeek, beforeWeek, getWeekMonday } from '@repo/shared/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as renderNative, within } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import type React from 'react';
import { Pressable, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Index from '../../../app/(tabs)/(afterLogin)/(routine)/index';
import { appThemes } from '../../../theme/themes';
import { palette } from '../../../theme/tokens';
import {
  act,
  describeAuthRedirect,
  fireEvent,
  render,
  resetAuthMocks,
  waitFor,
} from '../../setup/auth-test-utils';
import {
  createMockRoutine,
  createMockRoutines,
} from '../../setup/routine/mock';

const formatRoutineHeaderDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  return `${year}. ${month}. ${day} ${dayOfWeek}`;
};

const formatRoutineDateKey = (date: Date) => {
  const year = date.getFullYear() - 2000;
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}${month}${day}`;
};

const getRoutineWeekIndex = (date: Date) => (date.getDay() + 6) % 7;

const flattenStyles = (styles: unknown): object[] => {
  if (!styles) return [];
  if (Array.isArray(styles)) {
    return styles.flatMap((style) => flattenStyles(style));
  }

  return [styles as object];
};

const flattenPressableStyles = (style: unknown): object[] => {
  if (typeof style === 'function') {
    return flattenStyles(style({ pressed: false }));
  }

  return flattenStyles(style);
};

const findAncestorStyleWith = (
  node: { parent?: unknown; props?: { style?: unknown } } | null,
  styleKey: string,
): object[] => {
  let current = node;

  while (current) {
    const styles = flattenStyles(current.props?.style);
    if (styles.some((style) => styleKey in style)) {
      return styles;
    }

    current = current.parent as typeof current;
  }

  return [];
};

const ROUTINE_SCROLL_INDICATOR_TOP_SPACING = 8;
const ROUTINE_SCROLL_INDICATOR_HEIGHT = 24;
const ROUTINE_ITEM_HEIGHT = 108;

const createSharedQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

function UpdateRoutineTrigger() {
  const updateRoutine = routineHooks.useUpdateRoutineMutation(
    mockUser.nickname,
  );

  return (
    <Pressable
      testID="trigger-routine-update"
      onPress={() =>
        updateRoutine.mutate({
          routineId: 1,
          routineName: '테스트 루틴 1',
        })
      }
    >
      <Text>수정 트리거</Text>
    </Pressable>
  );
}

const renderWithSharedQueryClient = (ui: React.ReactElement) => {
  const queryClient = createSharedQueryClient();

  return renderNative(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </SafeAreaProvider>,
  );
};

// global mock 타입 선언 (jest.setup.js에서 설정됨)
declare const mockPush: jest.Mock;
declare const mockSearchParams: Record<string, string | undefined>;
declare const mockUser: {
  backgroundImageUrl?: null | string;
  characterImageUrl: null | string;
  motto: null | string;
  mottos?: string[];
  nickname: string;
  role: 'ADMIN' | 'USER';
  userId: string;
};
declare const mockAuthStore: {
  user: null | typeof mockUser;
};
declare const mockRoutineStore: {
  type: 'number' | 'week';
  setType: jest.Mock;
  routineId: number;
  setRoutineId: jest.Mock;
  resetRoutineForm: jest.Mock;
};
const getMockFocusEffectCleanup = () =>
  (
    globalThis as typeof globalThis & {
      mockFocusEffectCleanup: null | (() => void);
    }
  ).mockFocusEffectCleanup;

// axios mock adapter
let mockAxios: MockAdapter;

describe('루틴 조회 페이지', () => {
  beforeEach(() => {
    resetAuthMocks();
    mockAxios = new MockAdapter(axiosInstance);
    mockAxios.onGet('/users/me').reply(200, {
      data: {
        ...mockUser,
        characterImageUrl:
          'https://cdn.example.com/characters/warrior-intermediate.png',
        backgroundImageUrl:
          'https://cdn.example.com/backgrounds/warrior-background.webp',
      },
    });
    // 기본 API 응답 설정 (인증 테스트용)
    mockAxios.onGet(/\/routine\/list/).reply(200, { data: [] });
    // 인증 요청 목록 API 기본 응답
    mockAxios.onGet(/\/routine\/confirm\/list/).reply(200, { data: [] });
  });

  afterEach(() => {
    mockAxios.restore();
  });

  // 공통 인증 테스트
  describeAuthRedirect(() => render(<Index />));

  describe('루틴 존재 여부 테스트', () => {
    describe('루틴이 존재하지 않는 경우', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, { data: [] });
      });

      it('등록된 루틴이 없습니다 메시지가 표시되고 배경 장식과 캐릭터가 표시된다', async () => {
        const { findByText, queryByTestId } = render(<Index />);

        expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
        expect(queryByTestId('routine-scene-background')).toBeOnTheScreen();
        expect(queryByTestId('routine-scene-character')).toBeOnTheScreen();
      });

      it('루틴이 없어도 드래그 새로고침을 할 수 있다', async () => {
        const { findByText, getByTestId } = render(<Index />);

        await findByText('등록된 루틴이 없습니다.');

        const routineListScroll = getByTestId('routine-list-scroll');

        expect(routineListScroll.props.scrollEnabled).toBe(true);
        expect(routineListScroll.props.alwaysBounceVertical).toBe(true);
        expect(routineListScroll.props.refreshControl).toBeTruthy();
      });

      it('빈 상태 캐릭터는 하단 기준으로 고정 배치한다', async () => {
        const { findByText, getByTestId } = render(<Index />);

        await findByText('등록된 루틴이 없습니다.');

        expect(
          flattenStyles(getByTestId('routine-character-area').props.style),
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ bottom: 48 }),
            expect.objectContaining({ position: 'absolute' }),
          ]),
        );
      });

      it('빈 상태에서도 한마디 말풍선이 항상 표시된다', async () => {
        mockAuthStore.user = {
          ...mockUser,
          motto: '오늘도 전진',
          mottos: [],
        };

        const { findByTestId, findByText } = render(<Index />);

        await findByText('등록된 루틴이 없습니다.');

        expect(await findByText('오늘도 전진')).toBeOnTheScreen();
        expect(
          await findByTestId('routine-character-speech-bubble'),
        ).toBeOnTheScreen();
      });
    });

    describe('루틴이 존재하는 경우', () => {
      beforeEach(() => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(2) });
      });

      it('루틴이 4개 이하여도 드래그 새로고침을 할 수 있다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(4) });

        const { findByText, getByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');

        const routineListScroll = getByTestId('routine-list-scroll');

        expect(routineListScroll.props.scrollEnabled).toBe(true);
        expect(routineListScroll.props.alwaysBounceVertical).toBe(true);
        expect(routineListScroll.props.onRefresh).toEqual(expect.any(Function));
      });

      it('루틴 목록이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
        expect(await findByText('테스트 루틴 2')).toBeOnTheScreen();
      });

      it('number 타입 루틴 제목을 좌측 정렬한다', async () => {
        const { findByText } = render(<Index />);

        const routineTitle = await findByText('테스트 루틴 1');
        const titleRowStyles = findAncestorStyleWith(
          routineTitle,
          'alignItems',
        );

        expect(flattenStyles(routineTitle.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ textAlign: 'left' }),
          ]),
        );
        expect(titleRowStyles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ alignItems: 'flex-start' }),
          ]),
        );
      });

      it('number 타입 루틴 제목 아래 라벨까지의 간격을 12px로 둔다', async () => {
        const { findByText } = render(<Index />);

        const routineTitle = await findByText('테스트 루틴 1');
        const titleRowStyles = findAncestorStyleWith(
          routineTitle,
          'marginBottom',
        );

        expect(titleRowStyles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ marginBottom: 12 }),
          ]),
        );
      });

      it('루틴 리스트 타이틀이 표시되지 않는다', async () => {
        const { queryByText, findByText } = render(<Index />);

        await findByText('테스트 루틴 1');
        expect(queryByText('루틴 리스트')).toBeNull();
      });

      it('루틴 추가 플로팅 버튼이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        expect(await findByLabelText('루틴 추가')).toBeOnTheScreen();
      });

      it('루틴 추가 플로팅 버튼을 누르면 이전 폼 값을 초기화하고 추가 모달로 이동한다', async () => {
        const { findByLabelText } = render(<Index />);

        const addButton = await findByLabelText('루틴 추가');

        fireEvent.press(addButton);

        expect(mockRoutineStore.resetRoutineForm).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/modal?type=routine-add');
      });

      it('자동 목록 갱신 중에는 리스트 pull-to-refresh 로딩을 표시하지 않는다', async () => {
        let resolveRefetch: (() => void) | undefined;

        mockSearchParams.date = getWeekMonday(new Date());
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/confirm\/list/).reply(200, { data: [] });
        mockAxios
          .onGet(/\/routine\/list/)
          .replyOnce(200, { data: createMockRoutines(1) })
          .onGet(/\/routine\/list/)
          .reply(
            () =>
              new Promise((resolve) => {
                resolveRefetch = () =>
                  resolve([200, { data: createMockRoutines(1) }]);
              }),
          );
        mockAxios.onPut('/routine/1').reply(200, { data: null });

        const { findByText, getByTestId } = renderWithSharedQueryClient(
          <>
            <Index />
            <UpdateRoutineTrigger />
          </>,
        );

        await findByText('테스트 루틴 1');
        expect(getByTestId('routine-list-scroll').props.refreshing).toBe(false);

        await act(async () => {
          fireEvent.press(getByTestId('trigger-routine-update'));
        });

        await waitFor(() => {
          expect(
            mockAxios.history.get.filter((request) =>
              request.url?.startsWith('/routine/list'),
            ),
          ).toHaveLength(2);
        });

        expect(getByTestId('routine-list-scroll').props.refreshing).toBe(false);

        resolveRefetch?.();
      });

      it('쿼리 자동 refetch 상태만으로 pull-to-refresh 로딩을 표시하지 않는다', async () => {
        const refetch = jest.fn();
        const refetchPausedRoutines = jest.fn();
        const routinesSpy = jest
          .spyOn(routineHooks, 'useRoutinesQuery')
          .mockReturnValue({
            data: createMockRoutines(1),
            isLoading: false,
            isRefetching: true,
            refetch,
          } as unknown as ReturnType<typeof routineHooks.useRoutinesQuery>);
        const pausedRoutinesSpy = jest
          .spyOn(routineHooks, 'usePausedRoutinesQuery')
          .mockReturnValue({
            data: [],
            isLoading: false,
            isRefetching: false,
            refetch: refetchPausedRoutines,
          } as unknown as ReturnType<
            typeof routineHooks.usePausedRoutinesQuery
          >);

        const { getByTestId, getByText } = render(<Index />);

        expect(getByText('테스트 루틴 1')).toBeOnTheScreen();
        expect(getByTestId('routine-list-scroll').props.refreshing).toBe(false);

        routinesSpy.mockRestore();
        pausedRoutinesSpy.mockRestore();
      });

      it('루틴 페이지가 포커스될 때 루틴 목록을 다시 조회한다', () => {
        const refetch = jest.fn();
        const routinesSpy = jest
          .spyOn(routineHooks, 'useRoutinesQuery')
          .mockReturnValue({
            data: createMockRoutines(1),
            isLoading: false,
            isRefetching: false,
            refetch,
          } as unknown as ReturnType<typeof routineHooks.useRoutinesQuery>);

        render(<Index />);

        expect(refetch).toHaveBeenCalledTimes(1);

        routinesSpy.mockRestore();
      });

      it('루틴 순서 변경 버튼을 누르면 정렬 모달로 이동한다', async () => {
        const { findByLabelText } = render(<Index />);

        const reorderButton = await findByLabelText('루틴 순서 변경');

        fireEvent.press(reorderButton);

        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('/modal?type=routine-reorder'),
        );
      });

      it('루틴 화면에서는 숨김 루틴 보기 버튼을 표시하지 않는다', async () => {
        const { findByText, queryByLabelText } = render(<Index />);

        expect(await findByText('테스트 루틴 1')).toBeOnTheScreen();
        expect(queryByLabelText('숨김 루틴 보기')).not.toBeOnTheScreen();
      });

      it('헤더 액션 아이콘 간격을 좁게 유지한다', async () => {
        const { findByLabelText, findByTestId } = render(<Index />);

        const [actions, reorderButton, notificationButton] = await Promise.all([
          findByTestId('routine-header-actions'),
          findByLabelText('루틴 순서 변경'),
          findByLabelText('인증 요청 알림'),
        ]);

        expect(flattenStyles(actions.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ gap: 4 })]),
        );
        expect(flattenPressableStyles(reorderButton.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ width: 24 })]),
        );
        expect(flattenPressableStyles(notificationButton.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ width: 24 })]),
        );
      });

      it('상단 헤더에 선택된 날짜가 표시된다', async () => {
        const specificDate = '2024-12-10';

        mockSearchParams.date = specificDate;

        const { findByText } = render(<Index />);

        expect(
          await findByText(formatRoutineHeaderDate(new Date(specificDate))),
        ).toBeOnTheScreen();
      });

      it('배경과 캐릭터 장식이 표시된다', async () => {
        const { findByTestId } = render(<Index />);

        expect(
          await findByTestId('routine-scene-background'),
        ).toBeOnTheScreen();
        expect(await findByTestId('routine-scene-character')).toBeOnTheScreen();
      });

      it('GET /users/me가 제공한 캐릭터와 배경 URL을 루틴 화면에 사용한다', async () => {
        const characterImageUrl =
          'https://cdn.example.com/characters/warrior-intermediate.png';
        const backgroundImageUrl =
          'https://cdn.example.com/backgrounds/warrior-background.webp';

        const { findByTestId } = render(<Index />);

        expect(await findByTestId('routine-scene-character')).toHaveProp(
          'source',
          { uri: characterImageUrl },
        );
        expect(await findByTestId('routine-scene-background')).toHaveProp(
          'source',
          { uri: backgroundImageUrl },
        );
        expect(
          mockAxios.history.get.filter(
            (request) => request.url === '/users/me',
          ),
        ).toHaveLength(1);
      });

      it('GET /users/me의 이미지 URL이 없으면 프론트 캐릭터와 배경을 표시하지 않는다', async () => {
        mockAxios.resetHandlers();
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(2) });
        mockAxios.onGet(/\/routine\/confirm\/list/).reply(200, { data: [] });
        mockAxios.onGet('/users/me').reply(200, {
          data: {
            ...mockUser,
            characterImageUrl: null,
            backgroundImageUrl: null,
          },
        });

        const { findByText, queryByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');
        expect(queryByTestId('routine-scene-character')).toBeNull();
        expect(queryByTestId('routine-scene-background')).toBeNull();
      });

      it('계정 한마디 말풍선이 항상 표시된다', async () => {
        mockAuthStore.user = {
          ...mockUser,
          motto: '매일 조금씩 앞으로 간다',
          mottos: [],
        };

        const { findByTestId, findByText } = render(<Index />);

        const [motto, speechBubble] = await Promise.all([
          findByText('매일 조금씩 앞으로 간다'),
          findByTestId('routine-character-speech-bubble'),
        ]);

        expect(motto).toBeOnTheScreen();
        expect(motto.props.numberOfLines).toBe(2);
        expect(motto.props.ellipsizeMode).toBe('tail');
        expect(flattenStyles(speechBubble.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ bottom: 104 })]),
        );
      });

      it('단일 한마디 조회값을 캐릭터 말풍선에 표시한다', async () => {
        mockAuthStore.user = {
          ...mockUser,
          motto: '오늘 할일을 내일로 미루지 말자',
        };

        const { findByText } = render(<Index />);

        expect(
          await findByText('오늘 할일을 내일로 미루지 말자'),
        ).toBeOnTheScreen();
      });

      it('단일 한마디는 하나의 말풍선으로 표시한다', async () => {
        mockAuthStore.user = {
          ...mockUser,
          motto: '첫 번째 한마디',
          mottos: [],
        };

        const { findAllByText, findByText } = render(<Index />);

        expect(await findByText('첫 번째 한마디')).toBeOnTheScreen();
        expect(await findAllByText('첫 번째 한마디')).toHaveLength(1);
      });

      it('한마디 배열 문자열은 개별 한마디로 풀어서 표시한다', async () => {
        mockAuthStore.user = {
          ...mockUser,
          motto: null,
          mottos: ['["작심삼일","오늘 할일을 내일로 미루지 말자!","테스트2"]'],
        };

        const { findByText, queryByText } = render(<Index />);

        expect(await findByText('작심삼일')).toBeOnTheScreen();
        expect(
          queryByText(
            '["작심삼일","오늘 할일을 내일로 미루지 말자!","테스트2"]',
          ),
        ).toBeNull();
      });

      it('좌우명이 없으면 캐릭터 말풍선에 기본 문구가 표시된다', async () => {
        mockAuthStore.user = {
          ...mockUser,
          motto: null,
          mottos: [],
        };

        const { findByText } = render(<Index />);

        expect(await findByText('안녕?')).toBeOnTheScreen();
      });

      it('배경이미지는 화면 하단에 붙고 루틴 추가 버튼은 하단에서 20 떨어진다', async () => {
        const { findByTestId, findByLabelText } = render(<Index />);

        const [backgroundArt, addButton] = await Promise.all([
          findByTestId('routine-background-art'),
          findByLabelText('루틴 추가'),
        ]);

        expect(flattenStyles(backgroundArt.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ bottom: 0 })]),
        );
        expect(flattenStyles(addButton.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ bottom: 20 })]),
        );
        expect(flattenStyles(addButton.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ backgroundColor: '#001A31' }),
          ]),
        );
      });

      it('루틴이 4개를 넘으면 하단 화살표가 표시된다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(5) });

        const { findByTestId } = render(<Index />);

        expect(
          await findByTestId('routine-scroll-indicator'),
        ).toBeOnTheScreen();
        expect(
          await findByTestId('routine-more-indicator-icon'),
        ).toBeOnTheScreen();
      });

      it('루틴이 4개를 넘으면 프리뷰 오버레이 레이어가 표시된다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(5) });

        const { findByText, findByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');

        expect(await findByTestId('routine-preview-overlay')).toBeOnTheScreen();
      });

      it('기본 상태에서는 리스트가 4개 높이로 펼쳐지고 스크롤이 활성화된다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(5) });

        const { findByText, getByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');

        fireEvent(getByTestId('routine-list-area'), 'layout', {
          nativeEvent: { layout: { height: 520 } },
        });

        const routineListViewport = getByTestId('routine-list-viewport');
        const routineListScroll = getByTestId('routine-list-scroll');

        const viewportStyles = flattenStyles(routineListViewport.props.style);

        expect(viewportStyles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ overflow: 'hidden' }),
            expect.objectContaining({ height: ROUTINE_ITEM_HEIGHT * 4 }),
          ]),
        );
        expect(routineListScroll.props.scrollEnabled).toBe(true);
        expect(routineListScroll.props.estimatedItemSize).toBe(
          ROUTINE_ITEM_HEIGHT,
        );

        fireEvent(getByTestId('routine-list-area'), 'layout', {
          nativeEvent: { layout: { height: 620 } },
        });

        expect(flattenStyles(routineListViewport.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ height: ROUTINE_ITEM_HEIGHT * 4 }),
          ]),
        );
        expect(routineListScroll.props.estimatedItemSize).toBe(
          ROUTINE_ITEM_HEIGHT,
        );
      });

      it('하단 버튼을 누르면 리스트가 2개 높이로 접히고 스크롤이 비활성화된다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(5) });

        const { findByText, getByTestId, findByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');

        fireEvent(getByTestId('routine-list-area'), 'layout', {
          nativeEvent: { layout: { height: 520 } },
        });

        const routineListViewport = getByTestId('routine-list-viewport');
        const routineListScroll = getByTestId('routine-list-scroll');

        fireEvent.press(getByTestId('routine-scroll-indicator'));

        const viewportStyles = flattenStyles(routineListViewport.props.style);

        expect(viewportStyles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ overflow: 'hidden' }),
            expect.objectContaining({ height: ROUTINE_ITEM_HEIGHT * 2 }),
          ]),
        );
        expect(routineListScroll.props.scrollEnabled).toBe(false);
        expect(await findByTestId('routine-preview-overlay')).toBeOnTheScreen();
      });

      it('펼친 리스트 높이는 루틴 리스트 7 비율 영역을 넘지 않는다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(5) });

        const { findByText, getByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');

        await act(async () => {
          fireEvent(getByTestId('routine-list-area'), 'layout', {
            nativeEvent: { layout: { height: 360 } },
          });
        });

        const routineListViewport = getByTestId('routine-list-viewport');
        const routineListScroll = getByTestId('routine-list-scroll');
        const maxListHeight =
          360 -
          ROUTINE_SCROLL_INDICATOR_HEIGHT -
          ROUTINE_SCROLL_INDICATOR_TOP_SPACING;

        expect(flattenStyles(routineListViewport.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ height: maxListHeight }),
          ]),
        );
        expect(routineListScroll.props.estimatedItemSize).toBe(
          ROUTINE_ITEM_HEIGHT,
        );
        expect(routineListScroll.props.scrollEnabled).toBe(true);
      });

      it('기본 펼침 상태에서 버튼을 누르면 리스트가 접힌다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(5) });

        const { findByText, getByTestId, findByLabelText } = render(<Index />);

        await findByText('테스트 루틴 1');

        fireEvent(getByTestId('routine-list-area'), 'layout', {
          nativeEvent: { layout: { height: 520 } },
        });

        expect(await findByLabelText('루틴 리스트 접기')).toBeOnTheScreen();

        fireEvent.press(getByTestId('routine-scroll-indicator'));

        const routineListViewport = getByTestId('routine-list-viewport');
        const routineListScroll = getByTestId('routine-list-scroll');

        const viewportStyles = flattenStyles(routineListViewport.props.style);

        expect(viewportStyles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ overflow: 'hidden' }),
            expect.objectContaining({ height: ROUTINE_ITEM_HEIGHT * 2 }),
          ]),
        );
        expect(routineListScroll.props.scrollEnabled).toBe(false);
        expect(await findByLabelText('루틴 리스트 펼치기')).toBeOnTheScreen();
      });

      it('루틴 리스트 토글 버튼은 현재 리스트 높이 아래에 배치된다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(5) });

        const { findByText, getByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');

        fireEvent(getByTestId('routine-list-area'), 'layout', {
          nativeEvent: { layout: { height: 520 } },
        });

        const scrollIndicatorContainer = getByTestId(
          'routine-scroll-indicator-container',
        );

        expect(flattenStyles(scrollIndicatorContainer.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              top:
                ROUTINE_ITEM_HEIGHT * 4 + ROUTINE_SCROLL_INDICATOR_TOP_SPACING,
            }),
          ]),
        );

        fireEvent.press(getByTestId('routine-scroll-indicator'));

        expect(flattenStyles(scrollIndicatorContainer.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              top:
                ROUTINE_ITEM_HEIGHT * 2 + ROUTINE_SCROLL_INDICATOR_TOP_SPACING,
            }),
          ]),
        );
      });

      it('루틴이 있어도 캐릭터는 빈 상태와 같은 하단 기준으로 고정 배치한다', async () => {
        const { findByText, getByTestId } = render(<Index />);

        await findByText('테스트 루틴 1');

        const routineListArea = getByTestId('routine-list-area');
        const routineCharacterArea = getByTestId('routine-character-area');
        const routineBottomSpacer = getByTestId('routine-bottom-spacer');

        expect(routineBottomSpacer.props.pointerEvents).toBe('none');
        expect(flattenStyles(routineListArea.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ flex: 7 })]),
        );
        expect(flattenStyles(routineBottomSpacer.props.style)).toEqual(
          expect.arrayContaining([expect.objectContaining({ flex: 3 })]),
        );
        expect(flattenStyles(routineCharacterArea.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ bottom: 48 }),
            expect.objectContaining({ position: 'absolute' }),
          ]),
        );
      });

      it('루틴이 4개 이하면 하단 화살표가 표시되지 않는다', async () => {
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(1) });

        const { queryByTestId, findByText } = render(<Index />);

        await findByText('테스트 루틴 1');

        expect(queryByTestId('routine-scroll-indicator')).toBeNull();
      });
    });
  });

  describe('루틴 달성횟수 UI 테스트 (number 타입)', () => {
    beforeEach(() => {
      mockRoutineStore.type = 'number';
    });

    describe('달성횟수가 목표보다 적은 경우', () => {
      const weeklyCount = 3; // 실제 달성 횟수
      const routineCount = 5; // 목표 횟수

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('달성률 퍼센트는 표시되지 않는다', async () => {
        const { findByText, queryByText } = render(<Index />);

        await findByText('테스트 루틴 1');

        expect(queryByText('60%')).not.toBeOnTheScreen();
      });

      it('1회부터 7회까지 회차 라벨이 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('1회')).toBeOnTheScreen();
        expect(await findByText('2회')).toBeOnTheScreen();
        expect(await findByText('3회')).toBeOnTheScreen();
        expect(await findByText('4회')).toBeOnTheScreen();
        expect(await findByText('5회')).toBeOnTheScreen();
        expect(await findByText('6회')).toBeOnTheScreen();
        expect(await findByText('7회')).toBeOnTheScreen();
      });

      it('루틴 아이템 배경은 gray 95로 표시된다', async () => {
        const { findByTestId } = render(<Index />);

        expect(await findByTestId('routine-count-card-surface-1')).toHaveStyle({
          backgroundColor: palette.theme.gray[95],
        });
      });

      it('달성한 횟수만큼 체크 아이콘이 표시된다', async () => {
        const { findAllByTestId, findByLabelText, findByTestId } = render(
          <Index />,
        );

        // weeklyCount(3)회 달성: 1회, 2회, 3회에 체크 아이콘
        expect(await findByLabelText('1회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('2회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('3회 달성')).toBeOnTheScreen();
        expect(
          (await findAllByTestId('routine-checkmark-icon')).length,
        ).toBeGreaterThan(0);

        // weeklyCount+1 ~ routineCount(4회, 5회)는 미달성 (목표 내)
        expect(await findByLabelText('4회 미달성')).toBeOnTheScreen();
        expect(await findByLabelText('5회 미달성')).toBeOnTheScreen();
        const unachievedGoal = await findByTestId('routine-count-check-1-4');

        expect(unachievedGoal).toHaveStyle({
          backgroundColor: palette.theme.gray[80],
        });
        expect(
          within(unachievedGoal).queryByTestId('routine-checkmark-icon'),
        ).not.toBeOnTheScreen();

        // routineCount+1 ~ 7회(6회, 7회)는 목표 없음
        expect(await findByLabelText('6회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('7회 목표 없음')).toBeOnTheScreen();
        expect(await findByTestId('routine-count-no-goal-icon-1-6')).toHaveProp(
          'color',
          palette.theme.gray[90],
        );
      });

      it('오늘 완료한 회차를 successDate의 오늘 날짜로 구분한다', async () => {
        const today = new Date();

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: weeklyCount + 1,
            routineCount,
            successDate: [formatRoutineDateKey(today)],
          }),
        });

        const { findByLabelText, findByTestId } = render(<Index />);

        expect(await findByLabelText('4회 오늘 완료')).toBeOnTheScreen();
        expect(await findByTestId('routine-count-check-1-4')).toBeOnTheScreen();
      });

      it('완료는 symbolColor, 오늘 완료는 gray 5 테두리, 요청 중은 대기 컬러로 표시한다', async () => {
        const today = new Date();
        const symbolColor = '#FF8A3D';
        const pendingRoutine = {
          ...createMockRoutine(0, {
            weeklyCount: 2,
            routineCount: 5,
            successDate: [formatRoutineDateKey(today)],
          }),
          hasPendingConfirmation: true,
          pendingConfirmationCount: 2,
          pendingConfirmationIds: [207, 208],
          symbolColor,
        };

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: [pendingRoutine],
        });

        const { findByLabelText, findByTestId } = render(<Index />);
        const [completedCheck, todayCompletedCheck, pendingCheck] =
          await Promise.all([
            findByTestId('routine-count-check-1-1'),
            findByTestId('routine-count-check-1-2'),
            findByTestId('routine-count-check-1-3'),
          ]);

        expect(await findByLabelText('3회 요청 중')).toBeOnTheScreen();
        expect(
          within(completedCheck).getByTestId('routine-checkmark-icon'),
        ).toHaveProp('color', palette.theme.gray[90]);
        expect(
          within(pendingCheck).getByTestId('routine-checkmark-icon'),
        ).toHaveProp('color', palette.theme.gray[90]);
        expect(flattenStyles(completedCheck.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ backgroundColor: symbolColor }),
          ]),
        );
        expect(flattenStyles(todayCompletedCheck.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ backgroundColor: symbolColor }),
            expect.objectContaining({
              borderColor: palette.theme.gray[5],
              borderWidth: 1,
            }),
          ]),
        );
        expect(flattenStyles(pendingCheck.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ backgroundColor: '#F57F17' }),
          ]),
        );
      });

      it('symbolColor가 없으면 성공 체크를 첫 번째 팔레트 컬러로 표시한다', async () => {
        const { findByTestId } = render(<Index />);

        expect(await findByTestId('routine-count-check-1-1')).toHaveStyle({
          backgroundColor: '#00D68F',
        });
      });

      it('과거 주에 목표만큼 못한 회차를 에러 배경과 gray 90 X 아이콘으로 표시한다', async () => {
        mockSearchParams.date = beforeWeek(new Date(getWeekMonday(new Date())));

        const { findByTestId } = render(<Index />);
        const [missedFourth, missedFifth] = await Promise.all([
          findByTestId('routine-count-check-1-4'),
          findByTestId('routine-count-check-1-5'),
        ]);

        const missedIcon = within(missedFourth).getByTestId(
          'routine-missed-icon',
        );

        expect(missedIcon).toHaveProp('color', palette.theme.gray[90]);
        expect(missedIcon).toHaveStyle({
          transform: [{ translateX: 0.4 }, { translateY: 0.4 }],
        });
        expect(missedFourth).toHaveStyle({
          backgroundColor: appThemes.blue.colors.feedback.error.bg,
        });
        expect(
          within(missedFifth).getByTestId('routine-missed-icon'),
        ).toHaveProp('color', palette.theme.gray[90]);
        expect(missedFifth).toHaveStyle({
          backgroundColor: appThemes.blue.colors.feedback.error.bg,
        });
      });
    });

    describe('달성횟수가 목표와 같은 경우', () => {
      const weeklyCount = 5; // 실제 달성 횟수
      const routineCount = 5; // 목표 횟수 (100% 달성)

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('체크마크 아이콘이 표시된다 (100% 달성)', async () => {
        const { findByText, findByLabelText, queryByText } = render(<Index />);

        await findByText('테스트 루틴 1');

        // 100% 달성시 퍼센트 텍스트 대신 체크 아이콘 표시
        await waitFor(() => {
          expect(queryByText('100%')).not.toBeOnTheScreen();
        });

        expect(await findByLabelText('5회 달성')).toBeOnTheScreen();
      });

      it('모든 목표에 체크 아이콘이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        // routineCount(5)회 모두 달성
        expect(await findByLabelText('1회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('2회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('3회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('4회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('5회 달성')).toBeOnTheScreen();

        // routineCount+1 ~ 7회(6회, 7회)는 목표 없음
        expect(await findByLabelText('6회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('7회 목표 없음')).toBeOnTheScreen();
      });
    });

    describe('달성횟수가 목표를 초과한 경우', () => {
      const weeklyCount = 7; // 실제 달성 횟수 (초과 달성)
      const routineCount = 5; // 목표 횟수

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('목표 내 달성에는 체크 아이콘, 초과 달성에는 초과 달성 아이콘이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        // 목표 routineCount(5)회 내 달성
        expect(await findByLabelText('1회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('2회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('3회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('4회 달성')).toBeOnTheScreen();
        expect(await findByLabelText('5회 달성')).toBeOnTheScreen();

        // 초과 달성 (routineCount+1 ~ weeklyCount: 6회, 7회)
        expect(await findByLabelText('6회 초과 달성')).toBeOnTheScreen();
        expect(await findByLabelText('7회 초과 달성')).toBeOnTheScreen();
      });
    });

    describe('목표가 0인 경우', () => {
      const weeklyCount = 0; // 실제 달성 횟수
      const routineCount = 0; // 목표 횟수 (0 >= 0 이므로 100% 달성으로 취급)

      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount, routineCount }),
        });
      });

      it('체크마크 아이콘이 표시된다 (목표 0, 달성 0은 100% 달성으로 취급)', async () => {
        const { findByText, findByLabelText, queryByText } = render(<Index />);

        await findByText('테스트 루틴 1');

        // weeklyCount >= routineCount (0 >= 0)이므로 퍼센트 대신 체크 아이콘 표시
        await waitFor(() => {
          expect(queryByText('0%')).not.toBeOnTheScreen();
        });

        expect(await findByLabelText('1회 목표 없음')).toBeOnTheScreen();
      });

      it('모든 회차가 목표 없음으로 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        // 모든 7회차가 목표 없음
        expect(await findByLabelText('1회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('2회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('3회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('4회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('5회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('6회 목표 없음')).toBeOnTheScreen();
        expect(await findByLabelText('7회 목표 없음')).toBeOnTheScreen();
      });
    });
  });

  describe('루틴 달성횟수 UI 테스트 (week 타입)', () => {
    beforeEach(() => {
      mockRoutineStore.type = 'week';
    });

    describe('week 타입 표시', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { weeklyCount: 3, routineCount: 5 }),
        });
      });

      it('요일 텍스트를 24px 체크박스 내부에 caption2 semibold로 표시한다', async () => {
        const todayIndex = getRoutineWeekIndex(new Date());
        const todayLabel = ['월', '화', '수', '목', '금', '토', '일'][
          todayIndex
        ];
        const { findByTestId } = render(<Index />);
        const todayCheckBox = await findByTestId(
          `routine-week-check-1-${todayIndex}`,
        );
        const todayText = within(todayCheckBox).getByText(todayLabel);

        expect(todayCheckBox).toHaveStyle({
          width: 24,
          height: 24,
          borderRadius: 6,
        });
        expect(todayText).toHaveStyle({
          color: palette.theme.gray[90],
          fontSize: 12,
        });
        expect(todayText).toHaveProp('fontWeight', '600');
      });

      it('루틴 아이템은 단일 카드에 테마 80 테두리와 테마 100 배경을 표시한다', async () => {
        const { findByTestId, queryByTestId } = render(<Index />);

        expect(await findByTestId('routine-week-card-outer-1')).toHaveStyle({
          borderRadius: 16,
          borderColor: palette.theme.blue[80],
          backgroundColor: palette.theme.blue[100],
        });
        expect(queryByTestId('routine-week-card-surface-1')).toBeNull();
      });

      it('week 타입 루틴 제목을 좌측 정렬한다', async () => {
        const { findByText } = render(<Index />);

        const routineTitle = await findByText('테스트 루틴 1');
        const titleRowStyles = findAncestorStyleWith(
          routineTitle,
          'alignItems',
        );

        expect(flattenStyles(routineTitle.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ textAlign: 'left' }),
          ]),
        );
        expect(titleRowStyles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ alignItems: 'flex-start' }),
          ]),
        );
      });

      it('week 타입 루틴 제목 아래 라벨까지의 간격을 12px로 둔다', async () => {
        const { findByText } = render(<Index />);

        const routineTitle = await findByText('테스트 루틴 1');
        const titleRowStyles = findAncestorStyleWith(
          routineTitle,
          'marginBottom',
        );

        expect(titleRowStyles).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ marginBottom: 12 }),
          ]),
        );
      });
    });

    describe('요일별 달성 아이콘 표시', () => {
      it('모든 요일을 동일한 28px 투명 외곽 프레임으로 감싼다', async () => {
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 0,
            routineCount: 5,
            successDate: [],
          }),
        });

        const { findByTestId } = render(<Index />);
        const frames = await Promise.all(
          Array.from({ length: 7 }, (_, index) =>
            findByTestId(`routine-week-check-frame-1-${index}`),
          ),
        );

        for (const frame of frames) {
          expect(frame).toHaveStyle({
            width: 28,
            height: 28,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
          });
        }
      });

      it('오늘 달성한 요일의 외곽 프레임만 루틴 컬러로 표시한다', async () => {
        const today = new Date();
        const monday = new Date(getWeekMonday(today));
        const todayIndex = getRoutineWeekIndex(today);
        const otherCompletedIndex = todayIndex === 0 ? 1 : 0;
        const otherCompletedDate = new Date(monday);

        otherCompletedDate.setDate(
          otherCompletedDate.getDate() + otherCompletedIndex,
        );
        const symbolColor = '#4CAF50';

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: [
            {
              ...createMockRoutine(0, {
                weeklyCount: 2,
                routineCount: 5,
                successDate: [
                  formatRoutineDateKey(today),
                  formatRoutineDateKey(otherCompletedDate),
                ],
              }),
              symbolColor,
            },
          ],
        });

        const { findByTestId } = render(<Index />);
        const [todayFrame, otherCompletedFrame] = await Promise.all([
          findByTestId(`routine-week-check-frame-1-${todayIndex}`),
          findByTestId(`routine-week-check-frame-1-${otherCompletedIndex}`),
        ]);

        expect(todayFrame).toHaveStyle({
          borderColor: symbolColor,
          borderWidth: 1,
        });
        expect(otherCompletedFrame).toHaveStyle({
          borderColor: 'transparent',
          borderWidth: 1,
        });
      });

      it('달성한 요일에는 루틴에서 설정한 컬러를 배경으로 표시한다', async () => {
        // 현재 주의 월, 화, 수 날짜를 동적으로 생성
        const today = new Date();
        const monday = new Date(getWeekMonday(today));
        const monDate = new Date(monday);
        const tueDate = new Date(monday);

        tueDate.setDate(tueDate.getDate() + 1);
        const wedDate = new Date(monday);

        wedDate.setDate(wedDate.getDate() + 2);
        const getSuccessLabel = (date: Date, dayName: string) =>
          formatRoutineDateKey(date) === formatRoutineDateKey(today)
            ? `${dayName}요일 오늘 완료`
            : `${dayName}요일 달성`;

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 3,
            routineCount: 5,
            successDate: [
              formatRoutineDateKey(monDate),
              formatRoutineDateKey(tueDate),
              formatRoutineDateKey(wedDate),
            ],
          }),
        });

        const { findByLabelText, findByTestId } = render(<Index />);

        // 달성한 요일 (월, 화, 수)
        expect(
          await findByLabelText(getSuccessLabel(monDate, '월')),
        ).toBeOnTheScreen();
        expect(
          await findByLabelText(getSuccessLabel(tueDate, '화')),
        ).toBeOnTheScreen();
        expect(
          await findByLabelText(getSuccessLabel(wedDate, '수')),
        ).toBeOnTheScreen();
        expect(
          within(await findByTestId('routine-week-check-1-0')).getByText('월'),
        ).toBeOnTheScreen();
        expect(await findByTestId('routine-week-check-1-0')).toHaveStyle({
          backgroundColor: '#00D68F',
        });
      });

      it('미래 날짜는 투명 배경과 soft 테마 80 테두리 및 텍스트로 표시한다', async () => {
        mockSearchParams.date = afterWeek(new Date(getWeekMonday(new Date())));
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 0,
            routineCount: 5,
            successDate: [],
          }),
        });

        const { findByTestId } = render(<Index />);
        const futureMonday = await findByTestId('routine-week-check-1-0');
        const futureMondayText = within(futureMonday).getByText('월');

        expect(futureMonday).toHaveStyle({
          backgroundColor: 'transparent',
          borderColor: palette.theme.softBlue[80],
          borderWidth: 1,
        });
        expect(futureMondayText).toHaveStyle({
          color: palette.theme.softBlue[80],
        });
      });

      it('오늘 미달성은 soft 테마 80 테두리와 gray 90 텍스트로 표시한다', async () => {
        const today = new Date();
        const todayIndex = getRoutineWeekIndex(today);
        const todayLabel = ['월', '화', '수', '목', '금', '토', '일'][
          todayIndex
        ];

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 0,
            routineCount: 5,
            successDate: [],
          }),
        });

        const { findByTestId } = render(<Index />);
        const todayCheckBox = await findByTestId(
          `routine-week-check-1-${todayIndex}`,
        );

        expect(todayCheckBox).toHaveStyle({
          backgroundColor: 'transparent',
          borderColor: palette.theme.softBlue[80],
          borderWidth: 1,
        });
        expect(within(todayCheckBox).getByText(todayLabel)).toHaveStyle({
          color: palette.theme.gray[90],
        });
      });

      it('오늘 완료한 요일을 successDate의 오늘 날짜로 구분한다', async () => {
        const today = new Date();
        const dayName = ['일', '월', '화', '수', '목', '금', '토'][
          today.getDay()
        ];

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 1,
            routineCount: 5,
            successDate: [formatRoutineDateKey(today)],
          }),
        });

        const { findByLabelText, findByTestId } = render(<Index />);

        expect(
          await findByLabelText(`${dayName}요일 오늘 완료`),
        ).toBeOnTheScreen();
        const todayCompletedCheck = await findByTestId(
          `routine-week-check-1-${getRoutineWeekIndex(today)}`,
        );

        expect(todayCompletedCheck).toBeOnTheScreen();
        expect(todayCompletedCheck).toHaveStyle({
          borderColor: palette.theme.gray[5],
          borderWidth: 1,
        });
      });

      it('완료는 symbolColor, 요청 중은 대기 컬러로 표시한다', async () => {
        const today = new Date();
        const monday = new Date(getWeekMonday(today));
        const todayIndex = getRoutineWeekIndex(today);
        const completedIndex = todayIndex === 0 ? 1 : 0;
        const completedDate = new Date(monday);

        completedDate.setDate(completedDate.getDate() + completedIndex);

        const symbolColor = '#4CAF50';
        const pendingRoutine = {
          ...createMockRoutine(0, {
            weeklyCount: 1,
            routineCount: 5,
            successDate: [formatRoutineDateKey(completedDate)],
          }),
          hasPendingConfirmation: true,
          pendingConfirmationCount: 1,
          pendingConfirmationIds: [207],
          symbolColor,
        };

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: [pendingRoutine],
        });

        const { findByLabelText, findByTestId } = render(<Index />);
        const [completedCheck, pendingCheck] = await Promise.all([
          findByTestId(`routine-week-check-1-${completedIndex}`),
          findByTestId(`routine-week-check-1-${todayIndex}`),
        ]);

        expect(
          await findByLabelText(
            `${['월', '화', '수', '목', '금', '토', '일'][todayIndex]}요일 요청 중`,
          ),
        ).toBeOnTheScreen();
        const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

        expect(
          within(completedCheck).getByText(dayLabels[completedIndex]),
        ).toHaveStyle({ color: palette.theme.gray[90] });
        expect(
          within(pendingCheck).getByText(dayLabels[todayIndex]),
        ).toHaveStyle({ color: palette.theme.gray[90] });
        expect(flattenStyles(completedCheck.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ backgroundColor: symbolColor }),
          ]),
        );
        expect(flattenStyles(pendingCheck.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ backgroundColor: '#F57F17' }),
          ]),
        );
      });

      it('symbolColor가 없으면 성공 요일을 첫 번째 팔레트 컬러로 표시한다', async () => {
        const monday = new Date(getWeekMonday(new Date()));

        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 1,
            routineCount: 5,
            successDate: [formatRoutineDateKey(monday)],
          }),
        });

        const { findByTestId } = render(<Index />);

        expect(await findByTestId('routine-week-check-1-0')).toHaveStyle({
          backgroundColor: '#00D68F',
        });
      });

      it('지나간 미달성 날짜를 테마 90 배경과 X SVG 아이콘으로 표시한다', async () => {
        mockSearchParams.date = beforeWeek(new Date(getWeekMonday(new Date())));
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, {
            weeklyCount: 0,
            routineCount: 5,
            successDate: [],
          }),
        });

        const { findByTestId } = render(<Index />);
        const missedMonday = await findByTestId('routine-week-check-1-0');

        expect(within(missedMonday).queryByText('월')).toBeNull();
        expect(
          within(missedMonday).getByTestId('routine-missed-icon'),
        ).toHaveProp('color', palette.theme.gray[90]);
        expect(missedMonday).toHaveStyle({
          backgroundColor: palette.theme.blue[90],
        });
      });
    });
  });

  describe('날짜 표시 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('현재 주 날짜가 상단 헤더에 표시된다', async () => {
      const { findByText } = render(<Index />);

      const today = new Date();
      const startDate = new Date(getWeekMonday(today));

      expect(
        await findByText(formatRoutineHeaderDate(startDate)),
      ).toBeOnTheScreen();
    });

    it('특정 날짜가 지정된 경우 해당 주 날짜가 상단 헤더에 표시된다', async () => {
      const specificDate = '2024-12-02'; // 특정 날짜 지정

      mockSearchParams.date = specificDate;

      const { findByText } = render(<Index />);

      const startDate = new Date(getWeekMonday(new Date(specificDate)));

      expect(
        await findByText(formatRoutineHeaderDate(startDate)),
      ).toBeOnTheScreen();
    });
  });

  describe('보기 방식 변경 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('number 타입일 때 회차 라벨이 표시된다', async () => {
      mockRoutineStore.type = 'number';
      const { findByText } = render(<Index />);

      expect(await findByText('1회')).toBeOnTheScreen();
    });
  });

  describe('체크박스 인증 요청 이동 테스트', () => {
    beforeEach(() => {
      mockSearchParams.date = getWeekMonday(new Date());
    });

    it('메이트가 지정된 number 타입 루틴 체크박스를 누르면 인증 요청 모달로 이동한다', async () => {
      mockRoutineStore.type = 'number';
      mockAxios.onGet(/\/routine\/list/).reply(200, {
        data: createMockRoutines(1, { mateNickname: 'mate' }),
      });

      const { findByTestId } = render(<Index />);

      fireEvent.press(await findByTestId('routine-count-check-1-4'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/modal?type=request');
      });
      expect(mockRoutineStore.setRoutineId).toHaveBeenCalledWith(1);
    });

    it('메이트가 없는 number 타입 루틴 체크박스를 눌러도 인증 요청 모달로 이동한다', async () => {
      mockRoutineStore.type = 'number';
      mockAxios.onGet(/\/routine\/list/).reply(200, {
        data: createMockRoutines(1, { mateNickname: '' }),
      });

      const { findByTestId } = render(<Index />);

      fireEvent.press(await findByTestId('routine-count-check-1-4'));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/modal?type=request');
      });
      expect(mockRoutineStore.setRoutineId).toHaveBeenCalledWith(1);
    });

    it('메이트가 지정된 week 타입 루틴 체크박스를 누르면 인증 요청 모달로 이동한다', async () => {
      mockRoutineStore.type = 'week';
      mockAxios.onGet(/\/routine\/list/).reply(200, {
        data: createMockRoutines(1, { mateNickname: 'mate' }),
      });

      const { findByTestId } = render(<Index />);

      fireEvent.press(
        await findByTestId(
          `routine-week-check-1-${getRoutineWeekIndex(new Date())}`,
        ),
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/modal?type=request');
      });
      expect(mockRoutineStore.setRoutineId).toHaveBeenCalledWith(1);
    });
  });

  describe('주 이동 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('이전 주 버튼이 표시된다', async () => {
      const { findByLabelText } = render(<Index />);

      expect(await findByLabelText('이전 주')).toBeOnTheScreen();
    });

    it('다음 주 버튼이 표시된다', async () => {
      const { findByLabelText } = render(<Index />);

      expect(await findByLabelText('다음 주')).toBeOnTheScreen();
    });

    it('이전 주 버튼이 올바르게 렌더링된다', async () => {
      const { findByLabelText } = render(<Index />);

      const prevButton = await findByLabelText('이전 주');

      // Link 컴포넌트의 href 속성 확인
      // expo-router Link는 내부적으로 href를 처리하므로
      // 버튼이 올바르게 렌더링되는지 확인
      expect(prevButton).toBeOnTheScreen();
    });

    it('다음 주 버튼이 올바르게 렌더링된다', async () => {
      const { findByLabelText } = render(<Index />);

      const nextButton = await findByLabelText('다음 주');

      expect(nextButton).toBeOnTheScreen();
    });

    it('특정 주에서 이전 주로 이동하면 날짜가 변경된다', async () => {
      const specificDate = '2024-12-09'; // 월요일

      mockSearchParams.date = specificDate;

      const { findByText, findByLabelText, rerender } = render(<Index />);

      const startDate = new Date(getWeekMonday(new Date(specificDate)));

      expect(
        await findByText(formatRoutineHeaderDate(startDate)),
      ).toBeOnTheScreen();

      // 이전 주 버튼 확인
      const prevButton = await findByLabelText('이전 주');

      expect(prevButton).toBeOnTheScreen();

      // 이전 주 날짜 계산
      const previousMonday = beforeWeek(new Date(specificDate));
      const prevStartDate = new Date(getWeekMonday(new Date(previousMonday)));

      // 이전 주로 이동한 경우의 날짜 확인 (URL 변경 후 재렌더링 시뮬레이션)
      mockSearchParams.date = previousMonday;
      rerender(<Index />);

      expect(
        await findByText(formatRoutineHeaderDate(prevStartDate)),
      ).toBeOnTheScreen();
    });

    it('특정 주에서 다음 주로 이동하면 날짜가 변경된다', async () => {
      const specificDate = '2024-12-09'; // 월요일

      mockSearchParams.date = specificDate;

      const { findByText, findByLabelText, rerender } = render(<Index />);

      const startDate = new Date(getWeekMonday(new Date(specificDate)));

      expect(
        await findByText(formatRoutineHeaderDate(startDate)),
      ).toBeOnTheScreen();

      // 다음 주 버튼 확인
      const nextButton = await findByLabelText('다음 주');

      expect(nextButton).toBeOnTheScreen();

      // 다음 주 날짜 계산
      const nextMonday = afterWeek(new Date(specificDate));
      const nextStartDate = new Date(getWeekMonday(new Date(nextMonday)));

      // 다음 주로 이동한 경우의 날짜 확인 (URL 변경 후 재렌더링 시뮬레이션)
      mockSearchParams.date = nextMonday;
      rerender(<Index />);

      expect(
        await findByText(formatRoutineHeaderDate(nextStartDate)),
      ).toBeOnTheScreen();
    });
  });

  describe('루틴 컨텍스트 메뉴 테스트', () => {
    describe('현재 주인 경우', () => {
      beforeEach(() => {
        mockSearchParams.date = getWeekMonday(new Date());
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(1) });
      });

      it('루틴 메뉴 버튼이 표시된다', async () => {
        const { findByLabelText, findByTestId } = render(<Index />);

        const menuButton = await findByLabelText('테스트 루틴 1 메뉴 열기');

        expect(menuButton).toBeOnTheScreen();
        expect(await findByTestId('routine-request-icon')).toBeOnTheScreen();
      });

      it('루틴 메뉴 버튼은 충분한 터치 영역을 갖고 아이콘을 오른쪽 끝에 정렬한다', async () => {
        const { findByLabelText } = render(<Index />);

        const menuButton = await findByLabelText('테스트 루틴 1 메뉴 열기');

        expect(flattenStyles(menuButton.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              width: 32,
              height: 56,
              alignItems: 'flex-end',
            }),
          ]),
        );
        expect(menuButton.props.hitSlop).toBeUndefined();
      });

      it('루틴 메뉴 버튼을 클릭하면 상세 모달로 이동하지 않고 왼쪽에 컨텍스트 메뉴를 표시한다', async () => {
        const { findByLabelText, findByTestId } = render(<Index />);

        const menuButton = await findByLabelText('테스트 루틴 1 메뉴 열기');

        fireEvent.press(menuButton);

        expect(await findByTestId('routine-context-menu-1')).toBeOnTheScreen();
        expect(mockPush).not.toHaveBeenCalledWith('/modal?type=routine-detail');
      });

      it('컨텍스트 메뉴 바깥을 클릭하면 메뉴를 닫는다', async () => {
        const { findByLabelText, findByTestId, queryByTestId } = render(
          <Index />,
        );

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));
        expect(await findByTestId('routine-context-menu-1')).toBeOnTheScreen();

        fireEvent.press(await findByTestId('routine-context-menu-backdrop'), {
          nativeEvent: { locationX: 10, locationY: 10 },
        });

        await waitFor(() => {
          expect(queryByTestId('routine-context-menu-1')).toBeNull();
        });
      });

      it('컨텍스트 메뉴 닫기 영역은 루틴 리스트 바깥까지 확장된다', async () => {
        const { findByLabelText, findByTestId } = render(<Index />);

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));

        const backdrop = await findByTestId('routine-context-menu-backdrop');

        expect(flattenStyles(backdrop.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              top: -1000,
              right: -1000,
              bottom: -1000,
              left: -1000,
            }),
          ]),
        );
      });

      it('컨텍스트 메뉴가 열린 상태에서 다른 루틴 메뉴 버튼 영역을 눌러도 메뉴를 닫는다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/confirm\/list/).reply(200, { data: [] });
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(2),
        });

        const { findByLabelText, findByTestId, getByTestId, queryByTestId } =
          render(<Index />);

        await findByLabelText('테스트 루틴 1 메뉴 열기');

        fireEvent(getByTestId('routine-list-container'), 'layout', {
          nativeEvent: { layout: { width: 360 } },
        });

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));
        expect(await findByTestId('routine-context-menu-1')).toBeOnTheScreen();

        fireEvent.press(getByTestId('routine-context-menu-backdrop'), {
          nativeEvent: { locationX: 350, locationY: ROUTINE_ITEM_HEIGHT + 10 },
        });

        await waitFor(() => {
          expect(queryByTestId('routine-context-menu-1')).toBeNull();
          expect(queryByTestId('routine-context-menu-2')).toBeNull();
        });
      });

      it('다른 페이지로 이동했다가 돌아오면 열린 컨텍스트 메뉴를 닫는다', async () => {
        const { findByLabelText, findByTestId, queryByTestId } = render(
          <Index />,
        );

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));
        expect(await findByTestId('routine-context-menu-1')).toBeOnTheScreen();

        await act(async () => {
          getMockFocusEffectCleanup()?.();
        });

        expect(queryByTestId('routine-context-menu-1')).toBeNull();
      });

      it('컨텍스트 메뉴는 인증요청, 수정, 삭제 순으로 표시된다', async () => {
        const { findByLabelText, findAllByTestId } = render(<Index />);

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));

        const menuItems = await findAllByTestId('routine-context-menu-item');

        expect(menuItems.map((item) => item.props.accessibilityLabel)).toEqual([
          '인증요청',
          '수정',
          '삭제',
        ]);
      });

      it('숨김 상태 루틴의 컨텍스트 메뉴도 숨김/일시정지 라벨을 표시하지 않는다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/confirm\/list/).reply(200, { data: [] });
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(1, { hidden: true }),
        });

        const { findByLabelText, findAllByTestId } = render(<Index />);

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));

        const menuItems = await findAllByTestId('routine-context-menu-item');

        expect(menuItems.map((item) => item.props.accessibilityLabel)).toEqual([
          '인증요청',
          '수정',
          '삭제',
        ]);
      });

      it('컨텍스트 메뉴 스타일을 디자인 값으로 표시한다', async () => {
        const { findByLabelText, findByTestId, findAllByTestId } = render(
          <Index />,
        );

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));

        const [menu, menuItems, menuTexts] = await Promise.all([
          findByTestId('routine-context-menu-1'),
          findAllByTestId('routine-context-menu-item'),
          findAllByTestId('routine-context-menu-item-text'),
        ]);

        expect(flattenStyles(menu.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              right: 40,
              width: 144,
              padding: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: palette.theme.gray[200],
              backgroundColor: '#FFFFFF',
              shadowColor: '#000000',
              shadowOpacity: 0.18,
              shadowRadius: 18,
              elevation: 12,
            }),
            expect.objectContaining({
              top: 15,
            }),
          ]),
        );
        expect(flattenStyles(menuItems[0].props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              height: 30,
              paddingLeft: 8,
              justifyContent: 'center',
            }),
          ]),
        );
        expect(menuTexts[0].props.fontSize).toBe('$body3');
        expect(menuTexts[0].props.fontWeight).toBe('400');
        expect(flattenStyles(menuTexts[0].props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ color: palette.theme.gray[50] }),
          ]),
        );
        expect(flattenStyles(menuTexts[2].props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ color: palette.theme.red[50] }),
          ]),
        );
      });

      it('스크롤 후 루틴 메뉴 버튼을 클릭하면 보이는 위치에 컨텍스트 메뉴를 표시한다', async () => {
        mockAxios.resetHandlers();
        mockAxios.onGet(/\/routine\/confirm\/list/).reply(200, { data: [] });
        mockAxios.onGet(/\/routine\/list/).reply(200, {
          data: createMockRoutines(5),
        });

        const { findByLabelText, findByText, findByTestId, getByTestId } =
          render(<Index />);

        await findByText('테스트 루틴 1');

        fireEvent.press(getByTestId('routine-scroll-indicator'));
        fireEvent.scroll(getByTestId('routine-list-scroll'), {
          nativeEvent: {
            contentOffset: { y: ROUTINE_ITEM_HEIGHT * 2 },
            contentSize: { height: ROUTINE_ITEM_HEIGHT * 5, width: 360 },
            layoutMeasurement: { height: ROUTINE_ITEM_HEIGHT * 4, width: 360 },
          },
        });
        fireEvent.press(await findByLabelText('테스트 루틴 5 메뉴 열기'));

        const menu = await findByTestId('routine-context-menu-5');

        expect(flattenStyles(menu.props.style)).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              top: ROUTINE_ITEM_HEIGHT * 2 + 15,
            }),
          ]),
        );
      });

      it('컨텍스트 메뉴의 인증요청을 클릭하면 요청 모달이 열린다', async () => {
        const { findByLabelText } = render(<Index />);

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));
        fireEvent.press(await findByLabelText('인증요청'));

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/modal?type=request');
        });
      });
    });

    describe('과거 주인 경우', () => {
      beforeEach(() => {
        // 2주 전 날짜로 설정
        const pastDate = beforeWeek(new Date(getWeekMonday(new Date())));

        mockSearchParams.date = beforeWeek(new Date(pastDate));
        mockAxios
          .onGet(/\/routine\/list/)
          .reply(200, { data: createMockRoutines(1) });
      });

      it('컨텍스트 메뉴에서 인증요청을 표시하지 않는다', async () => {
        const { findByLabelText, findAllByTestId, queryByLabelText } = render(
          <Index />,
        );

        fireEvent.press(await findByLabelText('테스트 루틴 1 메뉴 열기'));

        const menuItems = await findAllByTestId('routine-context-menu-item');

        expect(menuItems.map((item) => item.props.accessibilityLabel)).toEqual([
          '수정',
          '삭제',
        ]);
        expect(queryByLabelText('인증요청')).not.toBeOnTheScreen();
      });
    });
  });

  describe('루틴 상세 모달 테스트', () => {
    beforeEach(() => {
      mockAxios
        .onGet(/\/routine\/list/)
        .reply(200, { data: createMockRoutines(1) });
    });

    it('루틴 이름을 눌러도 상세 모달로 이동하지 않는다', async () => {
      const { findByText, queryByLabelText } = render(<Index />);

      const routineTitle = await findByText('테스트 루틴 1');

      fireEvent.press(routineTitle);

      expect(mockPush).not.toHaveBeenCalledWith('/modal?type=routine-detail');
      expect(queryByLabelText('테스트 루틴 1 상세 보기')).toBeNull();
    });
  });

  describe('API 에러 테스트', () => {
    describe('서버 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).reply(500, {
          error: { message: '서버 오류가 발생했습니다.' },
        });
      });

      it('빈 목록 메시지가 표시된다 (initialData가 빈 배열)', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
      });
    });

    describe('네트워크 에러 발생 시', () => {
      beforeEach(() => {
        mockAxios.onGet(/\/routine\/list/).networkError();
      });

      it('빈 목록 메시지가 표시된다', async () => {
        const { findByText } = render(<Index />);

        expect(await findByText('등록된 루틴이 없습니다.')).toBeOnTheScreen();
      });
    });
  });

  describe('메이트 인증 요청 카운트 테스트', () => {
    describe('인증 요청이 없는 경우', () => {
      it('벨 아이콘이 표시된다', async () => {
        const { findByLabelText } = render(<Index />);

        expect(await findByLabelText('인증 요청 알림')).toBeOnTheScreen();
      });
    });
  });
});
