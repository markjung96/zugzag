type MeetingStatus = 'upcoming' | 'ongoing' | 'finished';

interface Attendance {
  undecided: string[];
  confirmed: string[];
}

interface Meeting {
  id: string;
  hostId: string;
  status: MeetingStatus;
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

interface CreateMeetingDto {
  meetingName: string;
  climbingGym: string;
  date: Date;
  isCrewMeeting: boolean;
  maxParticipants: number | null;
}

export type { Attendance, CreateMeetingDto, DailyMeetings, Meeting };
