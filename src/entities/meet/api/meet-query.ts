import { useQuery, useMutation, useQueryClient } from 'react-query';
import { meetApi } from './meet-api';
import { CreateMeetingDto } from '../model/meet-types';

const CACHE_TIME = {
  FIVE_MINUTES: 1000 * 60 * 5,
  THIRTY_MINUTES: 1000 * 60 * 30,
} as const;

export const QUERY_KEYS = {
  meets: ['meets'] as const,
  meet: (id: string) => ['meet', id] as const,
} as const;

export const meetQueries = {
  useMeets: () =>
    useQuery(QUERY_KEYS.meets, meetApi.getAllMeets, {
      staleTime: CACHE_TIME.FIVE_MINUTES, // 5분
      cacheTime: CACHE_TIME.THIRTY_MINUTES,
    }),

  useMeet: (id: string) =>
    useQuery(QUERY_KEYS.meet(id), () => meetApi.getMeetById(id), {
      staleTime: CACHE_TIME.FIVE_MINUTES, // 5분
      cacheTime: CACHE_TIME.THIRTY_MINUTES,
    }),
};

export const meetMutations = {
  useCreateMeet: () => {
    const queryClient = useQueryClient();
    return useMutation((newMeet: CreateMeetingDto) => meetApi.createMeet(newMeet), {
      onSuccess: () => {
        queryClient.invalidateQueries(QUERY_KEYS.meets);
      },
      onError: (error) => {
        console.error(error);
      },
    });
  },
};
