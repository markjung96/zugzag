import { apiInstance } from '@/shared/api/instance';
import { MEET_ENDPOINTS } from './meet-endpoints';
import { CreateMeetingDto, Meeting } from '../model/meet-types';

export const meetApi = {
  getAllMeets: () => apiInstance.get<Meeting[]>(MEET_ENDPOINTS.all()),
  getMeetById: (id: string) => apiInstance.get<Meeting>(MEET_ENDPOINTS.byId(id)),
  createMeet: (data: CreateMeetingDto) => apiInstance.post<CreateMeetingDto>(MEET_ENDPOINTS.create(), data),
};
