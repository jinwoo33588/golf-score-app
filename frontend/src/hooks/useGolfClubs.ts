import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { golfClubApi, GolfClubListParams } from '@/api/golfClubs';
import { GolfClub } from '@/types';

export const golfClubKeys = {
  all:    ['golfclubs'] as const,
  list:   (params?: GolfClubListParams) => [...golfClubKeys.all, 'list', params] as const,
  detail: (id: string) => [...golfClubKeys.all, 'detail', id] as const,
};

export function useGolfClubs(params?: GolfClubListParams) {
  return useQuery({
    queryKey: golfClubKeys.list(params),
    queryFn:  () => golfClubApi.list(params),
  });
}

export function useGolfClub(id: string) {
  return useQuery({
    queryKey: golfClubKeys.detail(id),
    queryFn:  () => golfClubApi.detail(id),
    enabled:  !!id,
  });
}

export function useCreateGolfClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GolfClub>) => golfClubApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: golfClubKeys.all }),
  });
}

export function useUploadHoleImage(clubId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ holeId, file }: { holeId: string; file: File }) =>
      golfClubApi.uploadHoleImage(clubId, holeId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: golfClubKeys.detail(clubId) }),
  });
}

export function useDeleteHoleImage(clubId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (holeId: string) => golfClubApi.deleteHoleImage(clubId, holeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: golfClubKeys.detail(clubId) }),
  });
}
