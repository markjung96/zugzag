interface Attendance {
  undecided: string[];
  confirmed: string[];
}

interface Meeting {
  meetingName: string;
  climbingGym: string;
  date: Date;
  isCrewMeeting: boolean;
  maxParticipants: number | null;
  attendance: Attendance;
}

type DailyMeetings = {
  [key: string]: Meeting[]; // key는 'YYYY-MM-DD' 형식
};

export type { Meeting, Attendance, DailyMeetings };
