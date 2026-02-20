import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { auth } from "@/auth";
import { crewsQueryKey } from "@/hooks/api/crews/use-crews-query";
import { getUserCrewsQuery } from "@/lib/queries/crews.queries";
import { CrewsContent } from "./crews-content";

export const metadata: Metadata = {
  title: "내 크루 | ZUGZAG",
  robots: { index: false, follow: false },
};

export default async function CrewsPage() {
  const session = await auth();
  const queryClient = new QueryClient();

  if (session?.user?.id) {
    await queryClient.prefetchQuery({
      queryKey: crewsQueryKey,
      queryFn: () => getUserCrewsQuery(session.user.id!),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CrewsContent />
    </HydrationBoundary>
  );
}
