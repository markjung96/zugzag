import React from 'react';
import { X } from 'lucide-react';

export interface Meeting {
  meetingName: string;
  climbingGym: string;
  date: Date;
  isCrewMeeting: boolean;
  maxParticipants: number | null;
  attendance: {
    confirmed: string[];
  };
}

interface MeetingFiltersProps {
  meetings: { [key: string]: Meeting[] };
  onFiltersChange: (filters: MeetingFilters) => void;
}

export interface MeetingFilters {
  gyms: string[];
  showCrewOnly: boolean;
  showAvailableOnly: boolean;
}

const MeetingFilters: React.FC<MeetingFiltersProps> = ({ meetings, onFiltersChange }) => {
  const [filters, setFilters] = React.useState<MeetingFilters>({
    gyms: [],
    showCrewOnly: false,
    showAvailableOnly: false,
  });

  // 모든 클라이밍장 목록 추출
  const allGyms = React.useMemo(() => {
    const gyms = new Set<string>();
    Object.values(meetings).forEach((dailyMeetings) => {
      dailyMeetings.forEach((meeting) => {
        gyms.add(meeting.climbingGym);
      });
    });
    return Array.from(gyms);
  }, [meetings]);

  const handleGymSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const gym = event.target.value;
    if (gym && !filters.gyms.includes(gym)) {
      const newFilters = {
        ...filters,
        gyms: [...filters.gyms, gym],
      };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    }
  };

  const handleGymRemove = (gym: string) => {
    const newFilters = {
      ...filters,
      gyms: filters.gyms.filter((g) => g !== gym),
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCheckboxChange = (field: 'showCrewOnly' | 'showAvailableOnly') => {
    const newFilters = {
      ...filters,
      [field]: !filters[field],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <select className="px-3 py-2 rounded-md border border-gray-300 bg-white" onChange={handleGymSelect} value="">
          <option value="">클라이밍장 선택</option>
          {allGyms.map((gym) => (
            <option key={gym} value={gym} disabled={filters.gyms.includes(gym)}>
              {gym}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.showCrewOnly}
            onChange={() => handleCheckboxChange('showCrewOnly')}
            className="rounded border-gray-300"
          />
          <span className="text-sm">크루 모임만 보기</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filters.showAvailableOnly}
            onChange={() => handleCheckboxChange('showAvailableOnly')}
            className="rounded border-gray-300"
          />
          <span className="text-sm">참여 가능한 모임만 보기</span>
        </label>
      </div>

      {/* 선택된 필터 표시 */}
      <div className="flex flex-wrap gap-2">
        {filters.gyms.map((gym) => (
          <span key={gym} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm">
            {gym}
            <button onClick={() => handleGymRemove(gym)} className="hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MeetingFilters;
