import { apiInstance } from '@/shared/api/instance';
import { CreateMeetingDto, Meeting } from './meet-types';

export const meetApi = {
  getAllMeets: () => apiInstance.get<Meeting[]>('/meetings'),
  getMeetById: (id: string) => apiInstance.get<Meeting>(`/meetings/${id}`),
  createMeet: (data: CreateMeetingDto) => apiInstance.post<CreateMeetingDto>('/meetings', data),
};
