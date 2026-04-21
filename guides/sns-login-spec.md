# 통합 인증 Provider 시스템 스펙

## 개요

모든 인증 방식(ID/PW, 카카오, Apple 등)을 **통합 Provider 패턴**으로 관리.
각 Provider가 인증과 API 호출을 모두 책임지며, SNS Provider는 공통 base class를 상속.

---

## 요구사항 요약

| 항목 | 결정 사항 |
|------|----------|
| SDK | `@react-native-seoul/kakao-login` |
| Expo 환경 | Dev Client (네이티브 모듈 사용 가능) |
| 인증 구조 | Provider 패턴 + SNS 공통 base class |
| UI 배치 | 기존 로그인 페이지 하단에 SNS 버튼 추가 |
| 첫 로그인 | SNS 신규 회원은 추가 정보 입력 필요 |
| 백엔드 API | `/auth/login` (credentials), `/auth/social/login` (SNS 공통) |

---

## 프론트엔드 아키텍처

### 디렉토리 구조

```
apps/native/
├── providers/
│   └── auth/
│       ├── types.ts                  # 인터페이스 정의
│       ├── base/
│       │   └── social.provider.ts    # SNS 공통 base class
│       ├── credentials.provider.ts   # ID/PW 로그인
│       ├── kakao.provider.ts         # 카카오 (SocialAuthProvider 상속)
│       ├── apple.provider.ts         # 애플 (SocialAuthProvider 상속)
│       └── index.ts                  # Provider Registry
│
├── hooks/
│   └── useAuth.ts                    # 통합 인증 훅 (분기 없음)
│
└── app/
    ├── sign-in.tsx
    └── complete-profile.tsx
```

---

## Provider 인터페이스

```typescript
// apps/native/providers/auth/types.ts

export type AuthProviderType = 'credentials' | 'kakao' | 'apple' | 'google' | 'naver';
export type SocialProviderType = Exclude<AuthProviderType, 'credentials'>;

// 인증 Payload
export interface CredentialsPayload {
  provider: 'credentials';
  userId: string;
  password: string;
}

export interface SocialPayload {
  provider: SocialProviderType;
  socialId: string;
  accessToken: string;
  idToken?: string;
}

export type AuthPayload = CredentialsPayload | SocialPayload;

// 디바이스 정보
export interface DeviceInfo {
  pushToken?: string;
  deviceType: 'ios' | 'android';
}

// 인증 응답 (공통)
export interface AuthResponse {
  isNewUser: boolean;
  userInfo?: User;
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
}

// Provider 인터페이스
export interface AuthProvider<T extends AuthProviderType = AuthProviderType> {
  type: T;
  name: string;
  isAvailable: () => boolean;
  authenticate: (params?: any) => Promise<AuthPayload>;
  callApi: (payload: AuthPayload, deviceInfo: DeviceInfo) => Promise<AuthResponse>;
  signOut?: () => Promise<void>;
}
```

---

## SNS 공통 Base Class

```typescript
// apps/native/providers/auth/base/social.provider.ts
import { socialLogin } from '@repo/shared/api/social-auth.api';
import {
  AuthProvider,
  AuthResponse,
  DeviceInfo,
  SocialPayload,
  SocialProviderType,
} from '../types';

export abstract class SocialAuthProvider implements AuthProvider<SocialProviderType> {
  abstract type: SocialProviderType;
  abstract name: string;

  // 기본적으로 모든 플랫폼에서 사용 가능 (override 가능)
  isAvailable(): boolean {
    return true;
  }

  // 각 SNS별로 구현해야 하는 메서드
  abstract authenticate(): Promise<SocialPayload>;

  // 공통 API 호출 로직 - 모든 SNS Provider가 동일한 API 사용
  async callApi(payload: SocialPayload, deviceInfo: DeviceInfo): Promise<AuthResponse> {
    return socialLogin({
      provider: payload.provider,
      socialId: payload.socialId,
      accessToken: payload.accessToken,
      idToken: payload.idToken,
      pushToken: deviceInfo.pushToken,
      deviceType: deviceInfo.deviceType,
    });
  }

  // 소셜 로그아웃 (optional, override 가능)
  async signOut(): Promise<void> {
    // 기본 구현 없음 - 필요한 Provider에서 override
  }
}
```

---

## Credentials Provider

```typescript
// apps/native/providers/auth/credentials.provider.ts
import { login as apiLogin } from '@repo/shared/api/auth.api';
import {
  AuthProvider,
  AuthResponse,
  CredentialsPayload,
  DeviceInfo,
} from './types';

interface CredentialsParams {
  userId: string;
  password: string;
}

class CredentialsAuthProvider implements AuthProvider<'credentials'> {
  type = 'credentials' as const;
  name = '아이디/비밀번호';

  isAvailable(): boolean {
    return true;
  }

  async authenticate(params: CredentialsParams): Promise<CredentialsPayload> {
    return {
      provider: 'credentials',
      userId: params.userId,
      password: params.password,
    };
  }

  async callApi(payload: CredentialsPayload, deviceInfo: DeviceInfo): Promise<AuthResponse> {
    const result = await apiLogin({
      userId: payload.userId,
      password: payload.password,
      pushToken: deviceInfo.pushToken,
      deviceType: deviceInfo.deviceType,
    });

    return {
      isNewUser: false,  // credentials 로그인은 항상 기존 회원
      userInfo: result.userInfo,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }
}

export const credentialsProvider = new CredentialsAuthProvider();
```

---

## Kakao Provider

```typescript
// apps/native/providers/auth/kakao.provider.ts
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
```

---

## Apple Provider (향후)

```typescript
// apps/native/providers/auth/apple.provider.ts
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { SocialAuthProvider } from './base/social.provider';
import { SocialPayload } from './types';

class AppleAuthProvider extends SocialAuthProvider {
  type = 'apple' as const;
  name = 'Apple';

  // iOS에서만 사용 가능
  isAvailable(): boolean {
    return Platform.OS === 'ios';
  }

  async authenticate(): Promise<SocialPayload> {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    return {
      provider: 'apple',
      socialId: credential.user,
      accessToken: credential.authorizationCode ?? '',
      idToken: credential.identityToken ?? undefined,
    };
  }
}

export const appleProvider = new AppleAuthProvider();
```

---

## Provider Registry

```typescript
// apps/native/providers/auth/index.ts
import { AuthProvider, AuthProviderType, SocialProviderType } from './types';
import { credentialsProvider } from './credentials.provider';
import { kakaoProvider } from './kakao.provider';
// import { appleProvider } from './apple.provider';

export * from './types';
export * from './base/social.provider';

const providers: Record<string, AuthProvider> = {
  credentials: credentialsProvider,
  kakao: kakaoProvider,
  // apple: appleProvider,
};

export function getProvider<T extends AuthProviderType>(type: T): AuthProvider<T> {
  const provider = providers[type];
  if (!provider) {
    throw new Error(`Unknown auth provider: ${type}`);
  }
  return provider as AuthProvider<T>;
}

export function getAvailableProviders(): AuthProvider[] {
  return Object.values(providers).filter(p => p.isAvailable());
}

export function getSocialProviders(): AuthProvider<SocialProviderType>[] {
  return getAvailableProviders().filter(
    (p): p is AuthProvider<SocialProviderType> => p.type !== 'credentials'
  );
}
```

---

## 통합 인증 Hook (분기 없음)

```typescript
// apps/native/hooks/useAuth.ts
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { saveTokens } from '@/api';
import { getProvider, AuthProviderType, DeviceInfo } from '@/providers/auth';
import { useNotifications } from './useNotifications';

export function useAuth() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const { pushToken } = useNotifications();

  const login = async <T extends AuthProviderType>(
    providerType: T,
    params?: T extends 'credentials' ? { userId: string; password: string } : never
  ) => {
    const provider = getProvider(providerType);

    const deviceInfo: DeviceInfo = {
      pushToken: pushToken?.data,
      deviceType: Platform.OS as 'ios' | 'android',
    };

    // 1. Provider에서 인증 정보 획득
    const payload = await provider.authenticate(params);

    // 2. Provider가 자신의 API 호출 (분기 없음!)
    const response = await provider.callApi(payload, deviceInfo);

    // 3. 결과 처리
    if (response.isNewUser) {
      router.push({
        pathname: '/complete-profile',
        params: {
          tempToken: response.tempToken,
          provider: providerType,
        },
      });
    } else {
      signIn(response.userInfo!);
      await saveTokens(response.accessToken!, response.refreshToken!);
      router.push('/(tabs)/(afterLogin)/(routine)');
    }
  };

  const logout = async (providerType?: AuthProviderType) => {
    // 기존 로그아웃 로직 + SNS 로그아웃
    if (providerType && providerType !== 'credentials') {
      const provider = getProvider(providerType);
      await provider.signOut?.();
    }
    // ... 기존 로그아웃
  };

  return { login, logout };
}
```

---

## 백엔드 API 스펙

### 1. Credentials 로그인 (기존 유지)

```
POST /auth/login
```

### 2. 소셜 로그인 (신규 - 모든 SNS 공통)

```
POST /auth/social/login
```

**Request:**
```json
{
  "provider": "kakao",
  "socialId": "1234567890",
  "accessToken": "sns_access_token",
  "idToken": null,
  "pushToken": "expo_push_token",
  "deviceType": "ios"
}
```

### 3. 추가 정보 입력 완료

```
POST /auth/complete-profile
```

---

## 타입 정의 (packages/types)

```typescript
// packages/types/src/dto/social-auth.ts

export type SocialProvider = 'kakao' | 'apple' | 'google' | 'naver';

export interface SocialLoginRequest {
  provider: SocialProvider;
  socialId: string;
  accessToken: string;
  idToken?: string;
  pushToken?: string;
  deviceType?: 'ios' | 'android';
}

export interface SocialLoginResponse {
  isNewUser: boolean;
  userInfo?: User;
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
}

export interface CompleteProfileRequest {
  tempToken: string;
  nickname: string;
  job: string;
  pushToken?: string;
  deviceType?: 'ios' | 'android';
}

export type CompleteProfileResponse = TokenResponse;
```

---

## API 클라이언트 (packages/shared)

```typescript
// packages/shared/api/social-auth.api.ts
import {
  SocialLoginRequest,
  SocialLoginResponse,
  CompleteProfileRequest,
  CompleteProfileResponse,
} from '@repo/types';
import http from './client';
import { toAppError } from '.';

const baseURL = '/auth';

export const socialLogin = async (
  request: SocialLoginRequest
): Promise<SocialLoginResponse> => {
  try {
    return await http.post(`${baseURL}/social/login`, request);
  } catch (error) {
    throw toAppError(error);
  }
};

export const completeProfile = async (
  request: CompleteProfileRequest
): Promise<CompleteProfileResponse> => {
  try {
    return await http.post(`${baseURL}/complete-profile`, request);
  } catch (error) {
    throw toAppError(error);
  }
};
```

---

## sign-in.tsx 사용 예시

```typescript
export default function SignIn() {
  const { login } = useAuth();
  const [form, setForm] = useState({ userId: '', password: '' });

  // ID/PW 로그인
  const handleLogin = () => login('credentials', form);

  // 카카오 로그인
  const handleKakaoLogin = () => login('kakao');

  return (
    <ThemeView>
      <AuthForm title="로그인">
        <Input value={form.userId} ... />
        <PasswordInput value={form.password} ... />
        <Button title="로그인" onPress={handleLogin} />
        <Link href="/sign-up" title="회원가입" />

        <Divider text="또는" />

        <KakaoLoginButton onPress={handleKakaoLogin} />
      </AuthForm>
    </ThemeView>
  );
}
```

---

## 구현 단계

### Phase 1: Provider 기반 구조
1. `types.ts` - 인터페이스 정의
2. `base/social.provider.ts` - SNS 공통 base class
3. `credentials.provider.ts` - 기존 로그인 Provider
4. `index.ts` - Registry

### Phase 2: 카카오 연동
1. `@react-native-seoul/kakao-login` 설치 및 설정
2. `kakao.provider.ts` 구현

### Phase 3: 백엔드 API
1. `POST /auth/social/login` 구현
2. `POST /auth/complete-profile` 구현

### Phase 4: 프론트엔드 통합
1. `hooks/useAuth.ts` 구현
2. `packages/shared/api/social-auth.api.ts` 구현
3. `sign-in.tsx` 수정
4. `complete-profile.tsx` 신규 화면

---

## 새 Provider 추가 방법

```typescript
// 1. SocialAuthProvider 상속
class NaverAuthProvider extends SocialAuthProvider {
  type = 'naver' as const;
  name = '네이버';

  async authenticate(): Promise<SocialPayload> {
    // 네이버 SDK 로직
    return { provider: 'naver', socialId: '...', accessToken: '...' };
  }
}

// 2. Registry에 등록
const providers = { ..., naver: new NaverAuthProvider() };

// 3. UI에 버튼 추가
<NaverLoginButton onPress={() => login('naver')} />
```

공통 API 호출 로직은 `SocialAuthProvider.callApi()`에서 자동 처리됨.
