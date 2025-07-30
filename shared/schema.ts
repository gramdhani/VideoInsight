import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  youtubeId: text("youtube_id").notNull().unique(),
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
    keyPoints: string[];
    ahaMonents: Array<{ timestamp: string; content: string }>;
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

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
