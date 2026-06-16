import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roundApi, RoundListParams } from '@/api/rounds';
import { CreateRoundRequest } from '@/types';

export const roundKeys = {
  all:    ['rounds'] as const,
  list:   (params?: RoundListParams) => [...roundKeys.all, 'list', params] as const,
  detail: (id: string) => [...roundKeys.all, 'detail', id] as const,
};

export function useRounds(params?: RoundListParams) {
  return useQuery({
    queryKey: roundKeys.list(params),
    queryFn:  () => roundApi.list(params),
  });
}

export function useRound(id: string) {
  return useQuery({
    queryKey: roundKeys.detail(id),
    queryFn:  () => roundApi.detail(id),
    enabled:  !!id,
  });
}

export function useCreateRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRoundRequest) => roundApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: roundKeys.all }),
  });
}

export function useDeleteRound() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roundApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: roundKeys.all }),
  });
}
