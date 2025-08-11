export type Role = 'artist' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
