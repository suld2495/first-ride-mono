export interface Auth {
  userId: string;
  nickname: string;
  password: string;
  job: string;
}

export type UserRole = 'USER' | 'ADMIN';
export type UserLoginType = 'PLAIN' | 'KAKAO' | 'APPLE' | 'GOOGLE' | 'NAVER';

export type User = Pick<Auth, 'userId' | 'nickname'> & {
  backgroundImageUrl?: null | string;
  characterImageUrl?: null | string;
  profileImage?: null | string;
  job?: string;
  jobType?: string;
  characterCode?: string;
  motto: null | string;
  mottos: string[];
  role: UserRole;
  loginType?: UserLoginType;
};
