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

// local style adapter 모킹
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
      muted: '#999999',
      soft: '#999999',
      disabled: '#CCCCCC',
      inverse: '#FFFFFF',
      link: '#0000FF',
      gray: '#18191B',
      title: '#18191B',
      pageHeaderTitle: '#18191B',
      label: '#272A2D',
      input: '#272A2D',
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
    questDetail: {
      periodBackground: '#000306',
      periodText: '#B0B4BA',
    },
    brand: {
      icon: '#000000',
      primary: '#0984e3',
      checkbox: '#0984e3',
      check: '#0984e3',
      selectedCheckbox: '#0984e3',
      selectedCheck: '#0984e3',
      todaySuccessCheckbox: '#B0DAFF',
      todaySuccessCheck: '#2C5171',
      routineBackground: '#FFFFFF',
      secondary: '#0984e3',
      text: '#2D3436',
      pendingConfirmationCheckbox: '#FFF9C4',
      pendingConfirmationCheck: '#FBC02D',
    },
  },
  foundation: {
    spacing: {
      0: 0,
      px: 1,
      0.5: 2,
      1: 4,
      1.5: 6,
      2: 8,
      2.5: 10,
      3: 12,
      3.5: 14,
      4: 16,
      5: 20,
      6: 24,
      7: 28,
      8: 32,
      9: 36,
      10: 40,
      11: 44,
      12: 48,
      14: 56,
      16: 64,
      20: 80,
      24: 96,
      28: 112,
      32: 128,
      36: 144,
      40: 160,
      44: 176,
      48: 192,
      52: 208,
      56: 224,
      60: 240,
      64: 256,
      72: 288,
      80: 320,
      96: 384,
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

jest.mock('@/components/ui/tamagui', () => {
  const React = require('react');
  const {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
  } = require('react-native');

  const createComponent = (Component) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(Component, { ref, ...props }, children),
    );
  const getMockTheme = () => {
    try {
      const {
        getEffectiveColorScheme,
        useColorSchemeStore,
      } = require('@/store/color-scheme.store');
      const { appThemes } = require('@/theme/themes');
      const { createFoundation } = require('@/theme/tokens');
      const themeName = getEffectiveColorScheme(useColorSchemeStore.getState());
      const theme = appThemes[themeName] ?? appThemes.blue;

      return {
        ...theme,
        foundation: createFoundation(theme),
      };
    } catch {
      return mockTheme;
    }
  };

  return {
    TamaguiButton: createComponent(Pressable),
    TamaguiInput: createComponent(TextInput),
    TamaguiSpinner: createComponent(ActivityIndicator),
    TamaguiStack: createComponent(View),
    TamaguiText: createComponent(Text),
    TamaguiXStack: createComponent(View),
    TamaguiYStack: createComponent(View),
    StyleSheet: {
      create: (styles) => {
        return new Proxy(
          {},
          {
            get(_, prop) {
              const mockStyles =
                typeof styles === 'function' ? styles(getMockTheme()) : styles;

              if (prop === 'useVariants') {
                return jest.fn(() => mockStyles);
              }

              return mockStyles[prop];
            },
          },
        );
      },
    },
    useAppTheme: () => ({
      theme: getMockTheme(),
    }),
    TamaguiRuntime: {},
  };
});

jest.mock('tamagui', () => {
  const React = require('react');
  const {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
  } = require('react-native');

  const createComponent = (Component) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(Component, { ref, ...props }, children),
    );

  return {
    TamaguiProvider: ({ children }) => children,
    Theme: ({ children }) => children,
    Text: createComponent(Text),
    Stack: createComponent(View),
    XStack: createComponent(View),
    YStack: createComponent(View),
    Button: createComponent(Pressable),
    Input: createComponent(TextInput),
    Spinner: createComponent(ActivityIndicator),
    createAnimations: (value) => value,
    createFont: (value) => value,
    createTamagui: (value) => value,
    createTokens: (value) => value,
  };
});

jest.mock('@tamagui/animations-react-native', () => ({
  createAnimations: (value) => value,
}));

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { FlatList } = require('react-native');

  return {
    FlashList: React.forwardRef((props, ref) =>
      React.createElement(FlatList, { ref, ...props }),
    ),
  };
});

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

// expo-haptics 모킹
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
  NotificationFeedbackType: {
    Success: 'Success',
    Warning: 'Warning',
    Error: 'Error',
  },
}));

// expo-device 모킹
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone 14',
  osName: 'iOS',
  osVersion: '16.0',
}));

// expo-notifications 모킹
jest.mock('expo-notifications', () => ({
  AndroidImportance: {
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
    MAX: 5,
  },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  setBadgeCountAsync: jest.fn(),
  getBadgeCountAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

// ========================================
// 공통 Mock 설정 (전역에서 사용 가능)
// ========================================

// expo-router mock
global.mockPush = jest.fn();
global.mockReplace = jest.fn();
global.mockDismissTo = jest.fn();
global.mockBack = jest.fn();
global.mockSearchParams = {};
global.mockFocusEffectCleanup = null;

jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TouchableOpacity } = require('react-native');

  return {
    useRouter: () => ({
      push: global.mockPush,
      replace: global.mockReplace,
      dismissTo: global.mockDismissTo,
      back: global.mockBack,
    }),
    useLocalSearchParams: () => global.mockSearchParams,
    useFocusEffect: (effect) => {
      React.useEffect(() => {
        global.mockFocusEffectCleanup = effect();

        return () => {
          if (typeof global.mockFocusEffectCleanup === 'function') {
            global.mockFocusEffectCleanup();
          }
          global.mockFocusEffectCleanup = null;
        };
      }, [effect]);
    },
    Redirect: ({ href }) =>
      React.createElement('Redirect', { href, testID: 'redirect' }),
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
global.mockUser = {
  nickname: 'testuser',
  userId: 'test123',
  motto: '끝까지 간다',
  mottos: ['끝까지 간다'],
  role: 'USER',
};
global.mockAuthStore = {
  user: global.mockUser,
  signIn: jest.fn(),
  signOut: jest.fn(),
};

jest.mock('./store/auth.store', () => ({
  useAuthStore: (selector) =>
    selector ? selector(global.mockAuthStore) : global.mockAuthStore,
}));

// routine store mock
global.mockRoutineStore = {
  type: 'number',
  setType: jest.fn(),
  routineId: 0,
  setRoutineId: jest.fn(),
  routineForm: {},
  setRoutineForm: jest.fn(),
  resetRoutineForm: jest.fn(),
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

jest.mock('@/widget/routine-widget-native', () => ({
  saveRoutineWidgetSnapshot: jest.fn(),
  clearRoutineWidgetSnapshot: jest.fn(),
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
