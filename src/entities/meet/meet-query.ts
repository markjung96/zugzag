import { useQuery, useMutation, useQueryClient } from 'react-query';
import { meetApi } from './meet-api';
import { CreateMeetingDto } from './meet-types';

export const QUERY_KEYS = {
  meets: ['meets'] as const,
  meet: (id: string) => ['meet', id] as const,
} as const;

export const meetQueries = {
  useMeets: () => {
    useQuery(QUERY_KEYS.meets, meetApi.getAllMeets, {
      staleTime: 1000 * 60 * 5, // 5분
      cacheTime: 1000 * 60 * 30, // 30분
    });
  },

  useMeet: (id: string) => {
    useQuery(QUERY_KEYS.meet(id), () => meetApi.getMeetById(id), {
      staleTime: 1000 * 60 * 5, // 5분
      cacheTime: 1000 * 60 * 30, // 30분
    });
  },
};

export const meetMutations = {
  useCreateMeet: () => {
    const queryClient = useQueryClient();
    return useMutation((newMeet: CreateMeetingDto) => meetApi.createMeet(newMeet), {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.meets);
      },
    });
  },
};
