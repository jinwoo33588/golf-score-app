import client from './client';
import { Round, CreateRoundRequest } from '@/types';

export interface RoundListParams { page?: number; limit?: number; golfClubId?: string; year?: string; }
export interface RoundListResponse { rounds: Round[]; total: number; page: number; limit: number; years: string[]; }

export const roundApi = {
  list:   (params?: RoundListParams) =>
    client.get<RoundListResponse>('/rounds', { params }).then((r) => r.data),
  detail: (id: string) =>
    client.get<{ round: Round }>(`/rounds/${id}`).then((r) => r.data.round),
  create: (dto: CreateRoundRequest) =>
    client.post<{ round: Round }>('/rounds', dto).then((r) => r.data.round),
  remove: (id: string) =>
    client.delete(`/rounds/${id}`),
};
