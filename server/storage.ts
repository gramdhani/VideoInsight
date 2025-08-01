import { 
  type Video, 
  type InsertVideo, 
  type ChatMessage, 
  type InsertChatMessage,
  type Feedback,
  type InsertFeedback,
  type User,
  type UpsertUser,
  users,
  videos,
  chatMessages,
  feedbacks
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Video operations
  getVideo(youtubeId: string): Promise<Video | undefined>;
  getUserVideo(userId: string, youtubeId: string): Promise<Video | undefined>;
  getVideoById(id: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  getUserVideos(userId: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  getChatMessages(videoId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Video operations
  async getVideo(youtubeId: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.youtubeId, youtubeId));
    return video;
  }

  async getUserVideo(userId: string, youtubeId: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(
      sql`${videos.userId} = ${userId} AND ${videos.youtubeId} = ${youtubeId}`
    );
    return video;
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getAllVideos(): Promise<Video[]> {
    const allVideos = await db.select().from(videos).orderBy(sql`${videos.createdAt} DESC`);
    return allVideos;
  }

  async getUserVideos(userId: string): Promise<Video[]> {
    const userVideos = await db.select().from(videos)
      .where(eq(videos.userId, userId))
      .orderBy(sql`${videos.createdAt} DESC`);
    return userVideos;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(videos)
      .values(insertVideo as any)
      .returning();
    return video;
  }

  async getChatMessages(videoId: string): Promise<ChatMessage[]> {
    const messages = await db.select().from(chatMessages).where(eq(chatMessages.videoId, videoId));
    return messages;
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values(insertMessage as any)
      .returning();
    return message;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db
      .insert(feedbacks)
      .values(insertFeedback as any)
      .returning();
    return feedback;
  }
}

export class MemStorage implements IStorage {
  private videos: Map<string, Video>;
  private chatMessages: Map<string, ChatMessage>;
  private feedbacks: Map<string, Feedback>;

  constructor() {
    this.videos = new Map();
    this.chatMessages = new Map();
    this.feedbacks = new Map();
  }

  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    // In-memory storage doesn't support users for auth
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // In-memory storage doesn't support users for auth
    throw new Error("In-memory storage doesn't support user operations");
  }

  async getVideo(youtubeId: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.youtubeId === youtubeId,
    );
  }

  async getUserVideo(userId: string, youtubeId: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.youtubeId === youtubeId && video.userId === userId,
    );
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getUserVideos(userId: string): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => video.userId === userId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = { 
      id,
      youtubeId: insertVideo.youtubeId,
      userId: insertVideo.userId,
      title: insertVideo.title,
      channel: insertVideo.channel,
      duration: insertVideo.duration,
      views: insertVideo.views,
      thumbnail: insertVideo.thumbnail,
      transcript: insertVideo.transcript || null,
      transcriptData: insertVideo.transcriptData as any || null,
      summary: insertVideo.summary as any || null,
      createdAt: new Date(),
    };
    this.videos.set(id, video);
    return video;
  }

  async getChatMessages(videoId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.videoId === videoId,
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      id,
      videoId: insertMessage.videoId,
      message: insertMessage.message,
      response: insertMessage.response,
      timestamps: insertMessage.timestamps as any || null,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedback: Feedback = { 
      id,
      name: insertFeedback.name,
      email: insertFeedback.email,
      message: insertFeedback.message,
      userId: insertFeedback.userId || null,
      createdAt: new Date(),
    };
    this.feedbacks.set(id, feedback);
    return feedback;
  }
}

export const storage = new DatabaseStorage();
