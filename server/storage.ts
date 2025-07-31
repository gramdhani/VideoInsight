import { 
  type Video, 
  type InsertVideo, 
  type ChatMessage, 
  type InsertChatMessage,
  type User,
  type UpsertUser,
  users,
  videos,
  chatMessages
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Video operations
  getVideo(youtubeId: string): Promise<Video | undefined>;
  getVideoById(id: string): Promise<Video | undefined>;
  getUserVideos(userId: string): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoUser(videoId: string, userId: string): Promise<Video>;
  getChatMessages(videoId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
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

  async getVideoById(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async getUserVideos(userId: string): Promise<Video[]> {
    const userVideos = await db.select().from(videos).where(eq(videos.userId, userId));
    return userVideos;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(videos)
      .values(insertVideo as any)
      .returning();
    return video;
  }

  async updateVideoUser(videoId: string, userId: string): Promise<Video> {
    const [video] = await db
      .update(videos)
      .set({ userId })
      .where(eq(videos.id, videoId))
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
}

export class MemStorage implements IStorage {
  private videos: Map<string, Video>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.videos = new Map();
    this.chatMessages = new Map();
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

  async getVideoById(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getUserVideos(userId: string): Promise<Video[]> {
    return Array.from(this.videos.values()).filter(
      (video) => video.userId === userId,
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = { 
      id,
      youtubeId: insertVideo.youtubeId,
      userId: insertVideo.userId || null,
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

  async updateVideoUser(videoId: string, userId: string): Promise<Video> {
    const video = this.videos.get(videoId);
    if (video) {
      video.userId = userId;
      this.videos.set(videoId, video);
      return video;
    }
    throw new Error("Video not found");
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
}

export const storage = new DatabaseStorage();
