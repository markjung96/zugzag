import mockMeetingData from './mock';

const getMeetings = async () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMeetingData);
    }, 1000);
  });

export { getMeetings };
