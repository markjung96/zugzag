-- Migration: Add constraints, indexes, and crews.is_public
-- Addresses audit findings: UNIQUE, CHECK, indexes, and missing is_public column

-- 1. crews.is_public 추가
ALTER TABLE "crews" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;

-- 2. UNIQUE 제약 추가
ALTER TABLE "crew_members" ADD CONSTRAINT "crew_members_crew_user_unique" UNIQUE("crew_id", "user_id");
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_round_user_unique" UNIQUE("round_id", "user_id");

-- 3. CHECK 제약 추가
ALTER TABLE "schedule_rounds" ADD CONSTRAINT "schedule_rounds_round_number_check" CHECK ("round_number" >= 1 AND "round_number" <= 5);

-- 4. 인덱스 추가
CREATE INDEX "crew_members_user_id_idx" ON "crew_members" ("user_id");
CREATE INDEX "rsvps_round_id_status_idx" ON "rsvps" ("round_id", "status");
CREATE INDEX "rsvps_user_id_idx" ON "rsvps" ("user_id");
CREATE INDEX "schedules_crew_id_date_idx" ON "schedules" ("crew_id", "date");
CREATE INDEX "schedule_rounds_schedule_id_idx" ON "schedule_rounds" ("schedule_id");
