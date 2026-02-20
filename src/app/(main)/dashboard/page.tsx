import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { auth } from "@/auth";
import { attendanceQueryKey } from "@/hooks/api/users/use-attendance-query";
import { schedulesQueryKey } from "@/hooks/api/schedules/use-schedules-query";
import { getUserAttendanceQuery } from "@/lib/queries/attendance.queries";
import { getUserSchedulesQuery } from "@/lib/queries/schedules.queries";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "대시보드 | ZUGZAG",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  const queryClient = new QueryClient();

  if (session?.user?.id) {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: attendanceQueryKey,
        queryFn: () => getUserAttendanceQuery(session.user.id!),
      }),
      queryClient.prefetchQuery({
        queryKey: schedulesQueryKey(3),
        queryFn: () => getUserSchedulesQuery(session.user.id!, 3),
      }),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
