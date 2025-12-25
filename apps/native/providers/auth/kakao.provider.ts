import { login, logout, getProfile } from '@react-native-seoul/kakao-login';

import { SocialAuthProvider } from './base/social.provider';
import { SocialPayload } from './types';

class KakaoAuthProvider extends SocialAuthProvider {
  type = 'kakao' as const;
  name = '카카오';

  async authenticate(): Promise<SocialPayload> {
    // 카카오 SDK로 로그인
    const tokenResult = await login();

    // 사용자 ID 조회
    const profile = await getProfile();

    return {
      provider: 'kakao',
      socialId: String(profile.id),
      accessToken: tokenResult.accessToken,
    };
  }

  async signOut(): Promise<void> {
    await logout();
  }
}

export const kakaoProvider = new KakaoAuthProvider();
