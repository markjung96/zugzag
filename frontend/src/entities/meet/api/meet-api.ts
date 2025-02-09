import { MEET_ENDPOINTS } from './meet-endpoints';
import { type CreateMeetingDto, type DailyMeetings, type Meeting } from '../model/meet-types';

import { apiInstance } from '@/shared/api/instance';

export const meetApi = {
  getAllMeets: () => apiInstance.get<DailyMeetings>(MEET_ENDPOINTS.all()),
  getMeetById: (id: string) => apiInstance.get<Meeting>(MEET_ENDPOINTS.byId(id)),
  createMeet: (data: CreateMeetingDto) => apiInstance.post<CreateMeetingDto>(MEET_ENDPOINTS.create(), data),
};
