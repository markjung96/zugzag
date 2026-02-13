import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  unique,
  index,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["leader", "admin", "member"]);
export const rsvpStatusEnum = pgEnum("rsvp_status", ["attending", "waiting", "cancelled"]);
export const roundTypeEnum = pgEnum("round_type", ["exercise", "meal", "afterparty", "other"]);

// Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  image: varchar("image", { length: 500 }),
  provider: varchar("provider", { length: 50 }), // google, kakao, credentials
  providerAccountId: varchar("provider_account_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crews Table
export const crews = pgTable("crews", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  inviteCode: varchar("invite_code", { length: 6 }).notNull().unique(),
  leaderId: uuid("leader_id")
    .references(() => users.id)
    .notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Crew Members Table
export const crewMembers = pgTable(
  "crew_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    crewId: uuid("crew_id")
      .references(() => crews.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: roleEnum("role").default("member").notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    unique("crew_members_crew_user_unique").on(table.crewId, table.userId),
    index("crew_members_user_id_idx").on(table.userId),
  ]
);

// Schedules Table (메타 정보만, 상세는 scheduleRounds에)
export const schedules = pgTable(
  "schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    crewId: uuid("crew_id")
      .references(() => crews.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
    description: text("description"),
    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),
    updatedBy: uuid("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("schedules_crew_id_date_idx").on(table.crewId, table.date)]
);

// Schedule Rounds Table (일정별 상세 정보)
export const scheduleRounds = pgTable(
  "schedule_rounds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scheduleId: uuid("schedule_id")
      .references(() => schedules.id, { onDelete: "cascade" })
      .notNull(),
    roundNumber: integer("round_number").notNull(), // 1~5
    type: roundTypeEnum("type").notNull(),
    title: varchar("title", { length: 50 }).notNull(),
    startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM
    endTime: varchar("end_time", { length: 5 }).notNull(), // HH:MM
    location: varchar("location", { length: 255 }).notNull(),
    // Place info (Kakao Maps)
    placeId: varchar("place_id", { length: 50 }),
    placeName: varchar("place_name", { length: 255 }),
    placeAddress: varchar("place_address", { length: 500 }),
    placeCategory: varchar("place_category", { length: 100 }),
    placePhone: varchar("place_phone", { length: 50 }),
    placeLongitude: varchar("place_longitude", { length: 50 }),
    placeLatitude: varchar("place_latitude", { length: 50 }),
    placeUrl: varchar("place_url", { length: 500 }),
    capacity: integer("capacity").notNull(), // 0 = 무관
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    check(
      "schedule_rounds_round_number_check",
      sql`${table.roundNumber} >= 1 AND ${table.roundNumber} <= 5`
    ),
    index("schedule_rounds_schedule_id_idx").on(table.scheduleId),
  ]
);

// RSVPs Table (일정별 참석)
export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roundId: uuid("round_id")
      .references(() => scheduleRounds.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    status: rsvpStatusEnum("status").default("attending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("rsvps_round_user_unique").on(table.roundId, table.userId),
    index("rsvps_round_id_status_idx").on(table.roundId, table.status),
    index("rsvps_user_id_idx").on(table.userId),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  ledCrews: many(crews),
  crewMemberships: many(crewMembers),
  rsvps: many(rsvps),
}));

export const crewsRelations = relations(crews, ({ one, many }) => ({
  leader: one(users, {
    fields: [crews.leaderId],
    references: [users.id],
  }),
  members: many(crewMembers),
  schedules: many(schedules),
}));

export const crewMembersRelations = relations(crewMembers, ({ one }) => ({
  crew: one(crews, {
    fields: [crewMembers.crewId],
    references: [crews.id],
  }),
  user: one(users, {
    fields: [crewMembers.userId],
    references: [users.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  crew: one(crews, {
    fields: [schedules.crewId],
    references: [crews.id],
  }),
  creator: one(users, {
    fields: [schedules.createdBy],
    references: [users.id],
    relationName: "scheduleCreator",
  }),
  updater: one(users, {
    fields: [schedules.updatedBy],
    references: [users.id],
    relationName: "scheduleUpdater",
  }),
  rounds: many(scheduleRounds),
}));

export const scheduleRoundsRelations = relations(scheduleRounds, ({ one, many }) => ({
  schedule: one(schedules, {
    fields: [scheduleRounds.scheduleId],
    references: [schedules.id],
  }),
  rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  round: one(scheduleRounds, {
    fields: [rsvps.roundId],
    references: [scheduleRounds.id],
  }),
  user: one(users, {
    fields: [rsvps.userId],
    references: [users.id],
  }),
}));
