import { login, logout, me } from '@react-native-kakao/user';

import { SocialAuthProvider } from './base/social.provider';
import type { SocialPayload } from './types';

class KakaoAuthProvider extends SocialAuthProvider {
  type = 'kakao' as const;
  name = '카카오';

  async authenticate(): Promise<SocialPayload> {
    const [tokenResult, user] = await Promise.all([login(), me()]);

    return {
      provider: 'kakao',
      socialId: String(user.id),
      accessToken: tokenResult.accessToken,
    };
  }

  async signOut(): Promise<void> {
    await logout();
  }
}

export const kakaoProvider = new KakaoAuthProvider();
