import type { Meeting } from '@/entities/meet/model/meet-types';

interface GatheringFilters {
  startDate: Date | null;
  endDate: Date | null;
  crewOnly: boolean;
  status: 'all' | Meeting['status'];
}

interface GatheringStore {
  // State
  selectedDate: Date | null;
  filters: GatheringFilters;
  selectedMeetingId: string | null;
  isCreateModalOpen: boolean;

  // Actions
  setSelectedDate: (date: Date | null) => void;
  setFilters: (filters: Partial<GatheringFilters>) => void;
  resetFilters: () => void;
  setSelectedMeetingId: (id: string | null) => void;
  toggleCreateModal: (isOpen?: boolean) => void;
}

export type { GatheringFilters, GatheringStore };
