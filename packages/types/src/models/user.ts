export interface Auth {
  email: string;
  name: string;
  password: string;
}

export type User = Pick<Auth, 'email' | 'name'>;
