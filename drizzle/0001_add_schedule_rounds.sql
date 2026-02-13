-- Migration: Add schedule_rounds table and round-based RSVP
-- This migration converts schedules to have rounds structure

-- Step 1: Create round_type enum
CREATE TYPE "public"."round_type" AS ENUM('exercise', 'meal', 'afterparty', 'other');

-- Step 2: Create schedule_rounds table
CREATE TABLE "schedule_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"schedule_id" uuid NOT NULL,
	"round_number" integer NOT NULL,
	"type" "round_type" NOT NULL,
	"title" varchar(50) NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"location" varchar(255) NOT NULL,
	"capacity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Step 3: Add foreign key constraint
ALTER TABLE "schedule_rounds" ADD CONSTRAINT "schedule_rounds_schedule_id_schedules_id_fk"
FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;

-- Step 4: Migrate existing schedules to schedule_rounds (as 1차 운동)
INSERT INTO "schedule_rounds" ("schedule_id", "round_number", "type", "title", "start_time", "end_time", "location", "capacity")
SELECT "id", 1, 'exercise', '운동', "start_time", "end_time", "location", "capacity"
FROM "schedules"
WHERE "start_time" IS NOT NULL AND "location" IS NOT NULL;

-- Step 5: Add round_id column to rsvps
ALTER TABLE "rsvps" ADD COLUMN "round_id" uuid;

-- Step 6: Migrate rsvps from schedule_id to round_id
UPDATE "rsvps" SET "round_id" = (
  SELECT "sr"."id" FROM "schedule_rounds" "sr"
  WHERE "sr"."schedule_id" = "rsvps"."schedule_id" AND "sr"."round_number" = 1
);

-- Step 7: Drop old foreign key constraint on rsvps
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_schedule_id_schedules_id_fk";

-- Step 8: Add new foreign key constraint on rsvps
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_round_id_schedule_rounds_id_fk"
FOREIGN KEY ("round_id") REFERENCES "public"."schedule_rounds"("id") ON DELETE cascade ON UPDATE no action;

-- Step 9: Make round_id NOT NULL (after data migration)
ALTER TABLE "rsvps" ALTER COLUMN "round_id" SET NOT NULL;

-- Step 10: Drop schedule_id column from rsvps
ALTER TABLE "rsvps" DROP COLUMN "schedule_id";

-- Step 11: Drop old columns from schedules
ALTER TABLE "schedules" DROP COLUMN "start_time";
ALTER TABLE "schedules" DROP COLUMN "end_time";
ALTER TABLE "schedules" DROP COLUMN "location";
ALTER TABLE "schedules" DROP COLUMN "capacity";
