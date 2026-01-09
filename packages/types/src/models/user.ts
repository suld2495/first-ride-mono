export interface Auth {
  userId: string;
  nickname: string;
  password: string;
  job: string;
}

export type UserRole = 'USER' | 'ADMIN';

export type User = Pick<Auth, 'userId' | 'nickname'> & {
  role: UserRole;
};
