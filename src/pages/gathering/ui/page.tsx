import React from 'react';

import { DatePickerWithRange } from '@shared/ui/date-picker';
import { Calendar } from '@/widgets';

export const GatheringPage = () => {
  return (
    <div>
      <DatePickerWithRange />
      <Calendar />
    </div>
  );
};
