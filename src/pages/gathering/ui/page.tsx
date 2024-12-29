import React, { useState } from 'react';

import { Calendar } from './calendar';
import Divider from './divider';
import MeetingList from './meet-list';
import mockMeetingData from '../mock';

export const GatheringPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <div>
      <Calendar onDateSelect={handleDateSelect} meetings={mockMeetingData} />
      <Divider>모임 목록</Divider>
      <MeetingList meetings={mockMeetingData} selectedDate={selectedDate} />
    </div>
  );
};
