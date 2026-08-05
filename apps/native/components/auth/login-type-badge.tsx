import type { UserLoginType } from '@repo/types';
import { View } from 'react-native';

import { StyleSheet, useAppTheme } from '@/components/ui/tamagui';
import { Typography } from '@/components/ui/typography';
import { palette } from '@/theme/tokens';

type SocialLoginType = Exclude<UserLoginType, 'PLAIN'>;

const SOCIAL_LOGIN_TYPE_LABELS: Record<SocialLoginType, string> = {
  KAKAO: '카카오',
  APPLE: 'Apple',
  GOOGLE: 'Google',
  NAVER: '네이버',
};

const SOCIAL_LOGIN_TYPE_COLORS: Partial<
  Record<SocialLoginType, { backgroundColor: string; textColor: string }>
> = {
  KAKAO: { backgroundColor: '#FEE500', textColor: '#000000' },
  APPLE: { backgroundColor: '#000000', textColor: '#FFFFFF' },
};

type ThemeTone = 'blue' | 'green' | 'red';

const getThemeTone = (themeName?: string): ThemeTone => {
  if (themeName === 'green' || themeName === 'red') {
    return themeName;
  }

  return 'blue';
};

const getThemePalette = (themeTone: ThemeTone) => {
  switch (themeTone) {
    case 'green':
      return {
        themeColor: palette.theme.green,
        softThemeColor: palette.theme.softGreen,
      };
    case 'red':
      return {
        themeColor: palette.theme.red,
        softThemeColor: palette.theme.softRed,
      };
    default:
      return {
        themeColor: palette.theme.blue,
        softThemeColor: palette.theme.softBlue,
      };
  }
};

interface LoginTypeBadgeProps {
  loginType?: UserLoginType | null;
  testID?: string;
  textTestID?: string;
}

const LoginTypeBadge = ({
  loginType,
  testID,
  textTestID,
}: LoginTypeBadgeProps) => {
  const { theme } = useAppTheme();

  if (!loginType || loginType === 'PLAIN') {
    return null;
  }

  const { themeColor, softThemeColor } = getThemePalette(
    getThemeTone(theme.name),
  );
  const loginTypeColors = SOCIAL_LOGIN_TYPE_COLORS[loginType];

  return (
    <View
      testID={testID}
      style={[
        styles.loginTypeBadge,
        {
          backgroundColor:
            loginTypeColors?.backgroundColor ?? softThemeColor[20],
        },
      ]}
    >
      <Typography
        color={loginTypeColors?.textColor ?? themeColor[80]}
        testID={textTestID ?? (testID ? `${testID}-text` : undefined)}
        variant="caption2"
        weight="semibold"
      >
        {SOCIAL_LOGIN_TYPE_LABELS[loginType]}
      </Typography>
    </View>
  );
};

export default LoginTypeBadge;

const styles = StyleSheet.create((theme) => ({
  loginTypeBadge: {
    alignSelf: 'flex-start',
    height: theme.foundation.dimension.x20,
    paddingHorizontal: theme.foundation.spacing[2],
    borderRadius: theme.foundation.dimension.x99,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
