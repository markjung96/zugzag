import React from 'react';

import { DatePickerWithRange } from '@shared/ui';
import { Calendar } from '@shared/ui';

export const GatheringPage = () => {
  return (
    <div>
      <DatePickerWithRange />
      <Calendar />
    </div>
  );
};
