import Link from 'next/link'
import { Calendar, MapPin, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils/format-date'
import { formatTime } from '@/lib/utils/format-time'

interface ScheduleCardProps {
  schedule: {
    id: string
    title: string
    date: string
    firstRoundTime?: string | null
    placeName?: string | null
    attendingCount: number
    capacity: number
  }
  crewId: string
}

export function ScheduleCard({ schedule, crewId }: ScheduleCardProps) {
  const isUnlimited = schedule.capacity === 0
  const progressValue = isUnlimited ? 0 : (schedule.attendingCount / schedule.capacity) * 100

  return (
    <Link href={`/crews/${crewId}/schedules/${schedule.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="p-4">
          <h3 className="font-semibold">{schedule.title}</h3>

          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(schedule.date)}</span>
              {schedule.firstRoundTime && (
                <span>{formatTime(schedule.firstRoundTime)}</span>
              )}
            </div>

            {schedule.placeName && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{schedule.placeName}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {schedule.attendingCount}
                {!isUnlimited && `/${schedule.capacity}`}명
              </span>
            </div>
          </div>

          {!isUnlimited && (
            <Progress value={progressValue} className="mt-3 h-2" />
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
