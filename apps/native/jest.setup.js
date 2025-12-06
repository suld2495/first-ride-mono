import '@testing-library/jest-native/extend-expect';

// alert 모킹
global.alert = jest.fn();

// useColorScheme 모킹
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

// expo-navigation-bar 모킹
jest.mock('expo-navigation-bar', () => ({
  setBackgroundColorAsync: jest.fn(),
  setButtonStyleAsync: jest.fn(),
  setPositionAsync: jest.fn(),
  setVisibilityAsync: jest.fn(),
  setBehaviorAsync: jest.fn(),
  setBorderColorAsync: jest.fn(),
}));

// expo-status-bar 모킹
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
  setStatusBarStyle: jest.fn(),
  setStatusBarBackgroundColor: jest.fn(),
}));

// ========================================
// 공통 Mock 설정 (전역에서 사용 가능)
// ========================================

// expo-router mock
global.mockPush = jest.fn();
global.mockReplace = jest.fn();
global.mockBack = jest.fn();
global.mockSearchParams = {};

jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TouchableOpacity } = require('react-native');

  return {
    useRouter: () => ({
      push: global.mockPush,
      replace: global.mockReplace,
      back: global.mockBack,
    }),
    useLocalSearchParams: () => global.mockSearchParams,
    Link: ({ href, children, asChild }) => {
      // asChild가 true면 children을 클론하여 onPress 추가
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
          onPress: () => {
            if (href === '..') {
              global.mockBack();
            } else {
              global.mockPush(href);
            }
          },
        });
      }
      // 일반 Link
      return React.createElement(
        TouchableOpacity,
        {
          testID: 'link',
          onPress: () => {
            if (href === '..') {
              global.mockBack();
            } else {
              global.mockPush(href);
            }
          },
        },
        children,
      );
    },
  };
});

// auth store mock
global.mockUser = { nickname: 'testuser', userId: 'test123' };
global.mockAuthStore = {
  user: global.mockUser,
  signIn: jest.fn(),
  signOut: jest.fn(),
};

jest.mock('./store/auth.store', () => ({
  useAuthStore: () => global.mockAuthStore,
}));

// routine store mock
global.mockRoutineStore = {
  type: 'number',
  setType: jest.fn(),
  routineId: 0,
  setRoutineId: jest.fn(),
  routineForm: {},
  setRoutineForm: jest.fn(),
};

jest.mock('./store/routine.store', () => ({
  useRoutineStore: (selector) => selector(global.mockRoutineStore),
}));

// request store mock
global.mockRequestStore = {
  requestId: 0,
  setRequestId: jest.fn(),
};

jest.mock('./store/request.store', () => ({
  useRequestStore: (selector) => selector(global.mockRequestStore),
}));

// toast mock
global.mockShowToast = jest.fn();
global.mockHideToast = jest.fn();

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: global.mockShowToast,
    hideToast: global.mockHideToast,
    toasts: [],
  }),
  ToastProvider: ({ children }) => children,
}));
