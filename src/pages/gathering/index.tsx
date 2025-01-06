import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import GatheringItem from '@pages/gathering-item';
import mockMeetingData from '@entities/meet/meet-mock';
import { Calendar, Divider, MeetingList } from '@features/gathering';

const GatheringPage = () => {
  const { id } = useParams(); // URL 파라미터에서 id 가져오기
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
  };

  // id가 있으면 상세 페이지를, 없으면 목록을 보여줍니다
  if (id) {
    return <GatheringItem />;
  }

  return (
    <div>
      <Calendar onDateSelect={handleDateSelect} meetings={mockMeetingData} />
      <Divider>모임 목록</Divider>
      <MeetingList meetings={mockMeetingData} selectedDate={selectedDate} />
    </div>
  );
};

export default GatheringPage;
