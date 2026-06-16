import client from './client';
import { User } from '@/types';

export interface LoginDto { email: string; password: string; }
export interface RegisterDto { nickname: string; email: string; password: string; distanceUnit?: 'meter' | 'yard'; }
export interface AuthResponse { token: string; user: User; }

export const authApi = {
  login:    (dto: LoginDto)    => client.post<AuthResponse>('/auth/login', dto).then((r) => r.data),
  register: (dto: RegisterDto) => client.post<AuthResponse>('/auth/register', dto).then((r) => r.data),
  me:       ()                 => client.get<{ user: User }>('/auth/me').then((r) => r.data.user),
  updateMe: (dto: Partial<Pick<User, 'nickname' | 'distanceUnit'>>) =>
    client.patch<{ user: User }>('/auth/me', dto).then((r) => r.data.user),
};
