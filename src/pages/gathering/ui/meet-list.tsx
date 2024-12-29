import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Users, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Meeting, DailyMeetings } from '../mock';

interface MeetingListProps {
  meetings: DailyMeetings;
  selectedDate: Date | null;
}

interface GroupedMeetings {
  [key: string]: Meeting[];
}

const MeetingList: React.FC<MeetingListProps> = ({ meetings, selectedDate }) => {
  const [groupedMeetings, setGroupedMeetings] = useState<GroupedMeetings>(meetings);

  // 선택된 날짜에 해당하는 모임 필터링
  const getFilteredMeetings = () => {
    if (!selectedDate) return groupedMeetings;

    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const filtered: GroupedMeetings = {};
    if (groupedMeetings[dateKey]) {
      filtered[dateKey] = groupedMeetings[dateKey];
    }
    return filtered;
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // 드롭이 유효한 위치에서 이루어지지 않은 경우
    if (!destination) return;

    // 같은 날짜 내에서의 순서 변경
    if (source.droppableId === destination.droppableId) {
      const dateKey = source.droppableId;
      const meetings = Array.from(groupedMeetings[dateKey]);
      const [reorderedMeeting] = meetings.splice(source.index, 1);
      meetings.splice(destination.index, 0, reorderedMeeting);

      setGroupedMeetings({
        ...groupedMeetings,
        [dateKey]: meetings,
      });
    }
    // 다른 날짜로 이동
    else {
      const sourceDateKey = source.droppableId;
      const destDateKey = destination.droppableId;
      const sourceMeetings = Array.from(groupedMeetings[sourceDateKey]);
      const destMeetings = Array.from(groupedMeetings[destDateKey] || []);

      const [movedMeeting] = sourceMeetings.splice(source.index, 1);
      // 날짜 업데이트
      const updatedMeeting = {
        ...movedMeeting,
        date: new Date(destDateKey + 'T' + format(movedMeeting.date, 'HH:mm:ss')),
      };

      destMeetings.splice(destination.index, 0, updatedMeeting);

      setGroupedMeetings({
        ...groupedMeetings,
        [sourceDateKey]: sourceMeetings,
        [destDateKey]: destMeetings,
      });
    }
  };

  const filteredMeetings = getFilteredMeetings();

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-4">
        {Object.entries(filteredMeetings).map(([dateKey, dateMeetings]) => (
          <div key={dateKey} className="rounded-lg border border-border bg-card">
            <div className="px-4 py-2 border-b border-border bg-muted">
              <h3 className="font-medium">{format(new Date(dateKey), 'M월 d일 (EEEE)', { locale: ko })}</h3>
            </div>
            <Droppable droppableId={dateKey}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="p-2 space-y-2">
                  {dateMeetings.map((meeting, index) => (
                    <Draggable
                      key={meeting.meetingName + meeting.date.toString()}
                      draggableId={meeting.meetingName + meeting.date.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-3 rounded-md bg-background border border-border hover:border-primary transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {meeting.meetingName}
                                {meeting.isCrewMeeting && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                    크루
                                  </span>
                                )}
                              </h4>
                              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>{format(meeting.date, 'a h:mm', { locale: ko })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{meeting.climbingGym}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    참석 {meeting.attendance.confirmed.length}명
                                    {meeting.maxParticipants && ` / ${meeting.maxParticipants}명`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default MeetingList;
