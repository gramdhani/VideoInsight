import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  youtubeId: text("youtube_id").notNull(),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  channel: text("channel").notNull(),
  duration: text("duration").notNull(),
  views: text("views").notNull(),
  thumbnail: text("thumbnail").notNull(),
  transcript: text("transcript"),
  transcriptData: jsonb("transcript_data").$type<Array<{
    text: string;
    startMs: string;
    endMs: string;
    startTimeText: string;
  }>>(),
  summary: jsonb("summary").$type<{
    shortSummary: string;
    outline: Array<{ title: string; items: string[] }>;
    keyTakeaways: Array<{ title: string; description: string; timestamp?: string }>;
    actionableSteps: Array<{ step: string; description: string; priority: 'high' | 'medium' | 'low' }>;
    readingTime: string;
    insights: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").references(() => videos.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  timestamps: jsonb("timestamps").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const promptConfigs = pgTable("prompt_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  systemPrompt: text("system_prompt").notNull(),
  userPrompt: text("user_prompt").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  description: text("description").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const personalizedPlans = pgTable("personalized_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").references(() => videos.id).notNull(),
  profileId: varchar("profile_id").references(() => profiles.id).notNull(),
  plan: jsonb("plan").$type<{
    items: Array<{
      title: string;
      whyItMatters: string;
      steps: string[];
      effort: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      metric: {
        name: string;
        target: string;
        timeframeDays: number;
      };
      suggestedDeadlineDays: number;
    }>;
    quickWins: Array<{
      title: string;
      steps: string[];
    }>;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({
  id: true,
  createdAt: true,
});

export const insertPromptConfigSchema = createInsertSchema(promptConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePromptConfigSchema = createInsertSchema(promptConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
});

export const insertPersonalizedPlanSchema = createInsertSchema(personalizedPlans).omit({
  id: true,
  createdAt: true,
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertPromptConfig = z.infer<typeof insertPromptConfigSchema>;
export type UpdatePromptConfig = z.infer<typeof updatePromptConfigSchema>;
export type PromptConfig = typeof promptConfigs.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertPersonalizedPlan = z.infer<typeof insertPersonalizedPlanSchema>;
export type PersonalizedPlan = typeof personalizedPlans.$inferSelect;

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
