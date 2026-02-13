import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Attendee {
  id: string
  name: string
  image: string | null
  status?: 'attending' | 'waiting'
}

interface AttendeeListProps {
  title: string
  attendees: Attendee[]
  emptyMessage?: string
}

export function AttendeeList({ title, attendees, emptyMessage = '참석자가 없습니다' }: AttendeeListProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
      {attendees.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={attendee.image || undefined} />
                <AvatarFallback>{attendee.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{attendee.name}</span>
              {attendee.status === 'waiting' && (
                <Badge variant="secondary" className="text-xs">대기</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
