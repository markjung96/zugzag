import { DailyMeetings } from './meet-types';

const mockMeetingData: DailyMeetings = {
  '2024-12-01': [
    {
      id: 'meet-1',
      meetingName: '토요일 아침 클라이밍',
      climbingGym: '클라이밍 파크',
      date: new Date('2024-12-01T09:00:00'),
      isCrewMeeting: false,
      maxParticipants: 6,
      attendance: {
        undecided: ['김미정', '이수진'],
        confirmed: ['박지훈', '최영희', '정민우'],
      },
    },
  ],
  '2024-12-03': [
    {
      id: 'meet-2',
      meetingName: '크루 정기 모임',
      climbingGym: '더클라임',
      date: new Date('2024-12-03T19:00:00'),
      isCrewMeeting: true,
      maxParticipants: null,
      attendance: {
        undecided: ['황민지', '고동욱', '이수진'],
        confirmed: ['김태희', '박지성', '이민호', '정유미', '강동원'],
      },
    },
    {
      id: 'meet-3',
      meetingName: '초보자 클라이밍',
      climbingGym: '더클라임',
      date: new Date('2024-12-03T15:00:00'),
      isCrewMeeting: false,
      maxParticipants: 4,
      attendance: {
        undecided: ['신보라'],
        confirmed: ['김초보', '이시작'],
      },
    },
  ],
  '2024-12-07': [
    {
      id: 'meet-4',
      meetingName: '볼더링 스터디',
      climbingGym: '클라이밍 랩',
      date: new Date('2024-12-07T14:00:00'),
      isCrewMeeting: false,
      maxParticipants: 8,
      attendance: {
        undecided: ['박서준', '김우진'],
        confirmed: ['이도현', '정해인', '배수지', '김새론'],
      },
    },
  ],
  '2024-12-10': [
    {
      id: 'meet-5',
      meetingName: '크루 대회 준비',
      climbingGym: '클라이밍 파크',
      date: new Date('2024-12-10T18:00:00'),
      isCrewMeeting: true,
      maxParticipants: null,
      attendance: {
        undecided: ['김연아', '이승기'],
        confirmed: ['박태환', '손흥민', '김연경', '이강인'],
      },
    },
  ],
  '2024-12-15': [
    {
      id: 'meet-6',
      meetingName: '주말 클라이밍',
      climbingGym: '더클라임',
      date: new Date('2024-12-15T11:00:00'),
      isCrewMeeting: false,
      maxParticipants: 5,
      attendance: {
        undecided: ['정우성'],
        confirmed: ['한효주', '송중기', '박보영'],
      },
    },
  ],
  '2024-12-20': [
    {
      id: 'meet-7',
      meetingName: '크루 송년회',
      climbingGym: '클라이밍 랩',
      date: new Date('2024-12-20T19:00:00'),
      isCrewMeeting: true,
      maxParticipants: null,
      attendance: {
        undecided: ['김태리', '류준열', '박보검'],
        confirmed: ['송강호', '전지현', '이병헌', '김혜수', '하정우', '손예진'],
      },
    },
  ],
};

export default mockMeetingData;
