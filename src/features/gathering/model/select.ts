import { useGatheringStore } from './store';

export const useSelectedDate = () => useGatheringStore((state) => state.selectedDate);

export const useGatheringFilters = () => useGatheringStore((state) => state.filters);

export const useFilteredStatus = () => useGatheringStore((state) => state.filters.status);

export const useSelectedMeetingId = () => useGatheringStore((state) => state.selectedMeetingId);

export const useIsCreateModalOpen = () => useGatheringStore((state) => state.isCreateModalOpen);

export const useGatheringActions = () => {
  const setSelectedDate = useGatheringStore((state) => state.setSelectedDate);
  const setFilters = useGatheringStore((state) => state.setFilters);
  const resetFilters = useGatheringStore((state) => state.resetFilters);
  const setSelectedMeetingId = useGatheringStore((state) => state.setSelectedMeetingId);
  const toggleCreateModal = useGatheringStore((state) => state.toggleCreateModal);

  return {
    setSelectedDate,
    setFilters,
    resetFilters,
    setSelectedMeetingId,
    toggleCreateModal,
  };
};
