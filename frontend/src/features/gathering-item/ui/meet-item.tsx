import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Users, Clock, MapPin, Edit, Trash2, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui';
import { Button } from '@shared/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui';
import { Badge } from '@shared/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui';

interface Meeting {
  id: string;
  meetingName: string;
  climbingGym: string;
  date: Date;
  isCrewMeeting: boolean;
  maxParticipants: number | null;
  description?: string;
  hostId: string;
  attendance: {
    confirmed: string[];
    maybe: string[];
  };
}

interface MeetingItemProps {
  meeting: Meeting;
  currentUserId: string;
  onEdit?: (meetingId: string) => void;
  onDelete?: (meetingId: string) => void;
  onAttendanceChange?: (status: 'confirmed' | 'maybe' | 'none') => void;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ meeting, currentUserId, onEdit, onDelete, onAttendanceChange }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isHost = currentUserId === meeting.hostId;
  const attendanceStatus = meeting.attendance.confirmed.includes(currentUserId)
    ? 'confirmed'
    : meeting.attendance.maybe.includes(currentUserId)
      ? 'maybe'
      : 'none';

  const handleDelete = () => {
    onDelete?.(meeting.id);
    setShowDeleteDialog(false);
  };

  const isMeetingFull =
    meeting.maxParticipants !== null && meeting.attendance.confirmed.length >= meeting.maxParticipants;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {meeting.meetingName}
                {meeting.isCrewMeeting && (
                  <Badge variant="secondary" className="ml-2">
                    크루
                  </Badge>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {format(meeting.date, 'yyyy년 M월 d일 (EEEE)', { locale: ko })}
              </div>
            </div>
            {isHost && (
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit?.(meeting.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{format(meeting.date, 'a h:mm', { locale: ko })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>{meeting.climbingGym}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>
                참석 {meeting.attendance.confirmed.length}명
                {meeting.maxParticipants && ` / ${meeting.maxParticipants}명`}
              </span>
            </div>
          </div>

          {meeting.description && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">모임 소개</h3>
              <p className="text-muted-foreground whitespace-pre-line">{meeting.description}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-4">참석자 명단</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">참석 확정 ({meeting.attendance.confirmed.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {meeting.attendance.confirmed.map((userId) => (
                    <Avatar key={userId}>
                      <AvatarImage src={`/avatars/${userId}.png`} />
                      <AvatarFallback>참석</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">미정 ({meeting.attendance.maybe.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {meeting.attendance.maybe.map((userId) => (
                    <Avatar key={userId}>
                      <AvatarImage src={`/avatars/${userId}.png`} />
                      <AvatarFallback>미정</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {!isHost && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-4">참석 여부</h3>
              <div className="flex gap-2">
                <Button
                  variant={attendanceStatus === 'confirmed' ? 'default' : 'outline'}
                  onClick={() => onAttendanceChange?.('confirmed')}
                  disabled={isMeetingFull && attendanceStatus !== 'confirmed'}
                >
                  참석
                </Button>
                <Button
                  variant={attendanceStatus === 'maybe' ? 'default' : 'outline'}
                  onClick={() => onAttendanceChange?.('maybe')}
                >
                  미정
                </Button>
                {attendanceStatus !== 'none' && (
                  <Button variant="outline" onClick={() => onAttendanceChange?.('none')}>
                    불참
                  </Button>
                )}
              </div>
              {isMeetingFull && attendanceStatus !== 'confirmed' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>정원이 가득 찼습니다</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>모임을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>이 작업은 되돌릴 수 없습니다. 모임이 영구적으로 삭제됩니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { MeetingItem };
