import client from './client';
import { GolfClub } from '@/types';

export interface GolfClubListParams { q?: string; region?: string; page?: number; limit?: number; }
export interface GolfClubListResponse { clubs: GolfClub[]; total: number; page: number; limit: number; }

export const golfClubApi = {
  list:   (params?: GolfClubListParams) =>
    client.get<GolfClubListResponse>('/golfclubs', { params }).then((r) => r.data),
  detail: (id: string) =>
    client.get<{ club: GolfClub }>(`/golfclubs/${id}`).then((r) => r.data.club),
  create: (data: Partial<GolfClub>) =>
    client.post<{ club: GolfClub }>('/golfclubs', data).then((r) => r.data.club),
  update: (id: string, data: Partial<GolfClub>) =>
    client.put<{ club: GolfClub }>(`/golfclubs/${id}`, data).then((r) => r.data.club),
  remove: (id: string) =>
    client.delete(`/golfclubs/${id}`),
  uploadHoleImage: (clubId: string, holeId: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return client.post<{ imageUrl: string }>(`/golfclubs/${clubId}/holes/${holeId}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.imageUrl);
  },
  deleteHoleImage: (clubId: string, holeId: string) =>
    client.delete(`/golfclubs/${clubId}/holes/${holeId}/image`),
};
