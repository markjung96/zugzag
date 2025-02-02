// features/gathering/ui/GatheringContent.tsx
import React from 'react';

import { Calendar, Divider, MeetingList } from '@features/gathering';

import { useGathering } from '../model/hook';
import { useGatheringActions } from '../model/select';

export const GatheringContent: React.FC = () => {
  const { meetings, selectedDate } = useGathering();
  const { setSelectedDate } = useGatheringActions();

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-4">
      <Calendar onDateSelect={handleDateSelect} meetings={meetings} />
      <Divider>모임 목록</Divider>
      <MeetingList meetings={meetings} selectedDate={selectedDate} />
    </div>
  );
};
