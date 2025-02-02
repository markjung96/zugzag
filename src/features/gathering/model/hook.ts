import { useMemo } from 'react';
import { useQuery, type QueryObserverResult } from 'react-query';

import { meetApi } from '@/entities/meet/api/meet-api';

import { useGatheringFilters, useSelectedDate } from './select';

import type { DailyMeetings } from '@/entities/meet/model/meet-types';
import type { ApiError } from '@/shared/api/types';

interface UseGatheringResult {
  meetings: DailyMeetings;
  selectedDate: Date | null;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => Promise<QueryObserverResult<DailyMeetings, ApiError>>;
}

const useGathering = (): UseGatheringResult => {
  const selectedDate = useSelectedDate();
  const filters = useGatheringFilters();

  const {
    data: meetings = {},
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DailyMeetings, ApiError>(['meetings', selectedDate, filters], meetApi.getAllMeets, {
    suspense: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const filteredMeetings = useMemo(() => {
    const filteredObj: DailyMeetings = {};

    Object.entries(meetings).forEach(([date, meetingsList]) => {
      filteredObj[date] = meetingsList.filter((meeting) => {
        if (filters.status === 'all') return true;
        return meeting.status === filters.status;
      });
    });

    return filteredObj;
  }, [meetings, filters.status]);

  return {
    meetings: filteredMeetings,
    selectedDate,
    isLoading,
    isError,
    error: error || null,
    refetch,
  };
};

export { useGathering };
