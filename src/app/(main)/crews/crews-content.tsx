"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Users, Moon, Sun, ChevronRight, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrewsQuery } from "@/hooks/api/crews/use-crews-query";
import type { Crew } from "@/types/crew.types";

export function CrewsContent() {
  const { theme, setTheme } = useTheme();

  const { data } = useCrewsQuery();
  const crews = data.crews;
  const hasCrews = crews.length > 0;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">내 크루</h1>
            {hasCrews && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-primary-foreground">
                {crews.length}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-10 w-10 rounded-xl"
            aria-label="테마 전환"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        {hasCrews ? (
          <div className="flex flex-col gap-4">
            {crews.map((crew) => (
              <CrewCard key={crew.id} crew={crew} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function CrewCard({ crew }: { crew: Crew }) {
  return (
    <Link href={`/crews/${crew.id}`}>
      <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
          <Users className="h-7 w-7 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="truncate font-bold">{crew.name}</h2>
            {crew.isLeader && (
              <span className="shrink-0 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                크루장
              </span>
            )}
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            멤버 {crew.memberCount}명
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
        <Users className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-bold">아직 소속된 크루가 없어요</h3>
      <p className="mb-8 text-center text-sm leading-relaxed text-muted-foreground">
        크루를 만들거나
        <br />
        초대 코드로 가입하세요
      </p>
      <div className="flex w-full max-w-xs flex-col gap-3 px-4">
        <Link href="/crews/new">
          <Button className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
            <Plus className="mr-2 h-5 w-5" />
            크루 생성하기
          </Button>
        </Link>
        <Link href="/crews/join">
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl border-2 text-base font-medium transition-all hover:border-primary hover:bg-primary/5"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            크루 가입하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
