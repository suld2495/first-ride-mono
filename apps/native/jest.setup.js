import '@testing-library/jest-native/extend-expect';

// alert 모킹
global.alert = jest.fn();

// @react-native-kakao/user 모킹
jest.mock('@react-native-kakao/user', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  me: jest.fn(),
}));

// expo-notifications 모킹
jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' }),
  ),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  AndroidImportance: { MAX: 5 },
  setNotificationChannelAsync: jest.fn(),
}));

// useNotifications 모킹
jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    pushToken: null,
    notification: null,
  }),
}));

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

// react-native-unistyles 모킹
const mockTheme = {
  colors: {
    background: {
      base: '#FFFFFF',
      surface: '#F5F5F5',
      elevated: '#FFFFFF',
      sunken: '#F0F0F0',
      overlay: 'rgba(0,0,0,0.5)',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      tertiary: '#999999',
      disabled: '#CCCCCC',
      inverse: '#FFFFFF',
      link: '#0000FF',
    },
    action: {
      primary: {
        default: '#007AFF',
        pressed: '#005BBF',
        disabled: '#CCCCCC',
        label: '#FFFFFF',
      },
      secondary: {
        default: '#F5F5F5',
        pressed: '#E0E0E0',
        disabled: '#CCCCCC',
        label: '#000000',
      },
      ghost: {
        default: 'transparent',
        pressed: '#F5F5F5',
        disabled: 'transparent',
        label: '#000000',
      },
    },
    feedback: {
      success: { bg: '#E8F5E9', text: '#2E7D32', border: '#66BB6A' },
      error: { bg: '#FFEBEE', text: '#FF0000', border: '#EF5350' },
      warning: { bg: '#FFF3E0', text: '#E65100', border: '#FF9800' },
      info: { bg: '#E3F2FD', text: '#1976D2', border: '#42A5F5' },
    },
    border: {
      default: '#E0E0E0',
      strong: '#BDBDBD',
      subtle: '#F5F5F5',
      focus: '#007AFF',
      divider: '#E0E0E0',
    },
  },
  foundation: {
    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
    },
    radii: {
      xs: 4,
      s: 8,
      m: 12,
      l: 16,
      xl: 20,
    },
    typography: {
      size: {
        xs: 10,
        s: 12,
        m: 14,
        l: 16,
        xl: 20,
        xxl: 24,
        title: 32,
      },
      weight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    opacity: {
      disabled: 0.5,
    },
    shadow: {
      s: {},
      m: {},
      l: {},
    },
  },
};

jest.mock('react-native-unistyles', () => ({
  StyleSheet: {
    create: (styles) => {
      const mockStyles =
        typeof styles === 'function' ? styles(mockTheme) : styles;
      return {
        ...mockStyles,
        useVariants: jest.fn(() => mockStyles),
      };
    },
  },
  useUnistyles: () => ({
    theme: mockTheme,
  }),
  UnistylesRuntime: {},
}));

// expo-constants 모킹
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        feedback: 'https://example.com/feedback',
      },
    },
  },
}));

// expo-web-browser 모킹
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
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
