import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  time,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// --- AUTH.JS TABLES ---
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: text("role").default("visitor").notNull(), // 'admin' or 'visitor'
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({ columns: [verificationToken.identifier, verificationToken.token] }),
  ]
);

// --- FESTIVAL DATA TABLES ---

export const stages = pgTable("stage", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").default(0).notNull(), // for layout sorting
});

export const artistCategories = pgTable("artist_category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // e.g., "koncert", "doprovodný program"
});

export const artists = pgTable("artist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  genre: text("genre"),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  imageUrl: text("image_url"),
  youtubeUrl: text("youtube_url"),
  spotifyUrl: text("spotify_url"),
  instagramUrl: text("instagram_url"),
  featuredSpotifyIframe: text("featured_spotify_iframe"),
  featuredYoutubeVideoId: text("featured_youtube_video_id"),
});

export const performances = pgTable("performance", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  artistId: text("artist_id")
    .notNull()
    .references(() => artists.id, { onDelete: "cascade" }),
  stageId: text("stage_id")
    .notNull()
    .references(() => stages.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .references(() => artistCategories.id, { onDelete: "set null" }),
  date: date("date").notNull(), // '2026-06-04'
  startTime: time("start_time").notNull(), // '18:00:00'
  endTime: time("end_time").notNull(),     // '19:00:00'
});

export const userSchedule = pgTable(
  "user_schedule",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    performanceId: text("performance_id")
      .notNull()
      .references(() => performances.id, { onDelete: "cascade" }),
  },
  (us) => [primaryKey({ columns: [us.userId, us.performanceId] })]
);

// --- RELATIONS ---

export const stagesRelations = relations(stages, ({ many }) => ({
  performances: many(performances),
}));

export const artistsRelations = relations(artists, ({ many }) => ({
  performances: many(performances),
}));

export const artistCategoriesRelations = relations(artistCategories, ({ many }) => ({
  performances: many(performances),
}));

export const performancesRelations = relations(performances, ({ one, many }) => ({
  artist: one(artists, {
    fields: [performances.artistId],
    references: [artists.id],
  }),
  stage: one(stages, {
    fields: [performances.stageId],
    references: [stages.id],
  }),
  category: one(artistCategories, {
    fields: [performances.categoryId],
    references: [artistCategories.id],
  }),
  userSchedules: many(userSchedule),
}));

export const userScheduleRelations = relations(userSchedule, ({ one }) => ({
  user: one(users, {
    fields: [userSchedule.userId],
    references: [users.id],
  }),
  performance: one(performances, {
    fields: [userSchedule.performanceId],
    references: [performances.id],
  }),
}));
