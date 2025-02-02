import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { GatheringFilters, GatheringStore } from './types';

const initialFilters: GatheringFilters = {
  startDate: null,
  endDate: null,
  status: 'all',
  crewOnly: false,
};

export const useGatheringStore = create<GatheringStore>()(
  devtools(
    (set) => ({
      selectedDate: null,
      filters: initialFilters,
      selectedMeetingId: null,
      isCreateModalOpen: false,

      // Actions
      setSelectedDate: (date) => set({ selectedDate: date }, false, 'setSelectedDate'),

      setFilters: (newFilters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
          }),
          false,
          'setFilters',
        ),

      resetFilters: () => set({ filters: initialFilters }, false, 'resetFilters'),

      setSelectedMeetingId: (id) => set({ selectedMeetingId: id }, false, 'setSelectedMeetingId'),

      toggleCreateModal: (isOpen) =>
        set(
          (state) => ({
            isCreateModalOpen: typeof isOpen === 'boolean' ? isOpen : !state.isCreateModalOpen,
          }),
          false,
          'toggleCreateModal',
        ),
    }),
    { name: 'GatheringStore' },
  ),
);
