import { 
  type Video, 
  type InsertVideo, 
  type ChatMessage, 
  type InsertChatMessage,
  type Feedback,
  type InsertFeedback,
  type User,
  type UpsertUser,
  type PromptConfig,
  type InsertPromptConfig,
  type UpdatePromptConfig,
  type Profile,
  type InsertProfile,
  type PersonalizedPlan,
  type InsertPersonalizedPlan,

  users,
  videos,
  chatMessages,
  feedbacks,
  promptConfigs,
  profiles,
  personalizedPlans,

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
  updateVideo(id: string, updates: Partial<Video>): Promise<Video>;
  deleteVideo(videoId: string, userId: string): Promise<boolean>;
  getChatMessages(videoId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Prompt configuration operations
  getAllPromptConfigs(): Promise<PromptConfig[]>;
  getPromptConfig(id: string): Promise<PromptConfig | undefined>;
  getActivePromptConfig(): Promise<PromptConfig | undefined>;
  createPromptConfig(config: InsertPromptConfig): Promise<PromptConfig>;
  updatePromptConfig(id: string, config: UpdatePromptConfig): Promise<PromptConfig | undefined>;
  deletePromptConfig(id: string): Promise<boolean>;
  activatePromptConfig(id: string): Promise<boolean>;
  
  // Profile operations
  getUserProfiles(userId: string): Promise<Profile[]>;
  getProfile(id: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, userId: string, updates: { name?: string; description?: string }): Promise<Profile | undefined>;
  deleteProfile(id: string, userId: string): Promise<boolean>;
  
  // Personalized plan operations
  getPersonalizedPlan(videoId: string, profileId: string): Promise<PersonalizedPlan | undefined>;
  createPersonalizedPlan(plan: InsertPersonalizedPlan): Promise<PersonalizedPlan>;
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

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    const [video] = await db
      .update(videos)
      .set(updates)
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(videoId: string, userId: string): Promise<boolean> {
    // First delete all personalized plans for this video
    await db.delete(personalizedPlans).where(eq(personalizedPlans.videoId, videoId));
    
    // Then delete all chat messages for this video
    await db.delete(chatMessages).where(eq(chatMessages.videoId, videoId));
    
    // Finally delete the video (only if it belongs to the user)
    const result = await db.delete(videos).where(
      sql`${videos.id} = ${videoId} AND ${videos.userId} = ${userId}`
    );
    return (result.rowCount ?? 0) > 0;
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

  // Prompt configuration operations
  async getAllPromptConfigs(): Promise<PromptConfig[]> {
    const configs = await db.select().from(promptConfigs).orderBy(sql`${promptConfigs.createdAt} DESC`);
    return configs;
  }

  async getPromptConfigsByType(type: "chat" | "summary" | "quick_action"): Promise<PromptConfig[]> {
    const configs = await db.select().from(promptConfigs)
      .where(eq(promptConfigs.type, type))
      .orderBy(sql`${promptConfigs.createdAt} DESC`);
    return configs;
  }

  async getPromptConfig(id: string): Promise<PromptConfig | undefined> {
    const [config] = await db.select().from(promptConfigs).where(eq(promptConfigs.id, id));
    return config;
  }

  async getActivePromptConfig(): Promise<PromptConfig | undefined> {
    const [config] = await db.select().from(promptConfigs)
      .where(sql`${promptConfigs.isActive} = true AND ${promptConfigs.type} = 'chat'`);
    return config;
  }

  async getActiveSummaryPromptConfig(): Promise<PromptConfig | undefined> {
    const [config] = await db.select().from(promptConfigs)
      .where(sql`${promptConfigs.isActive} = true AND ${promptConfigs.type} = 'summary'`);
    return config;
  }

  async createPromptConfig(insertConfig: InsertPromptConfig): Promise<PromptConfig> {
    const [config] = await db
      .insert(promptConfigs)
      .values(insertConfig as any)
      .returning();
    return config;
  }

  async updatePromptConfig(id: string, updateConfig: UpdatePromptConfig): Promise<PromptConfig | undefined> {
    const [config] = await db
      .update(promptConfigs)
      .set({
        ...updateConfig,
        updatedAt: new Date(),
      })
      .where(eq(promptConfigs.id, id))
      .returning();
    return config;
  }

  async deletePromptConfig(id: string): Promise<boolean> {
    const result = await db.delete(promptConfigs).where(eq(promptConfigs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveQuickActionPromptConfig(quickActionType: string): Promise<PromptConfig | undefined> {
    const [config] = await db.select().from(promptConfigs)
      .where(sql`${promptConfigs.isActive} = true AND ${promptConfigs.type} = 'quick_action' AND ${promptConfigs.quickActionType} = ${quickActionType}`);
    return config;
  }

  async activatePromptConfig(id: string): Promise<boolean> {
    // Get the config to determine its type
    const configToActivate = await this.getPromptConfig(id);
    if (!configToActivate) return false;
    
    // For quick actions, deactivate only configs of the same quick action type
    if (configToActivate.type === 'quick_action' && configToActivate.quickActionType) {
      await db.update(promptConfigs)
        .set({ isActive: false })
        .where(sql`${promptConfigs.type} = 'quick_action' AND ${promptConfigs.quickActionType} = ${configToActivate.quickActionType}`);
    } else {
      // For other types, deactivate all configs of the same type
      await db.update(promptConfigs)
        .set({ isActive: false })
        .where(eq(promptConfigs.type, configToActivate.type));
    }
    
    // Then activate the specified one
    const result = await db
      .update(promptConfigs)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(promptConfigs.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }
  
  // Profile operations
  async getUserProfiles(userId: string): Promise<Profile[]> {
    const userProfiles = await db.select().from(profiles)
      .where(eq(profiles.userId, userId))
      .orderBy(sql`${profiles.createdAt} DESC`);
    return userProfiles;
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values(insertProfile as any)
      .returning();
    return profile;
  }

  async updateProfile(id: string, userId: string, updates: { name?: string; description?: string }): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set(updates)
      .where(sql`${profiles.id} = ${id} AND ${profiles.userId} = ${userId}`)
      .returning();
    return profile;
  }

  async deleteProfile(id: string, userId: string): Promise<boolean> {
    // First delete all personalized plans for this profile
    await db.delete(personalizedPlans).where(eq(personalizedPlans.profileId, id));
    
    // Then delete the profile (only if it belongs to the user)
    const result = await db.delete(profiles).where(
      sql`${profiles.id} = ${id} AND ${profiles.userId} = ${userId}`
    );
    return (result.rowCount ?? 0) > 0;
  }
  
  // Personalized plan operations
  async getPersonalizedPlan(videoId: string, profileId: string): Promise<PersonalizedPlan | undefined> {
    const [plan] = await db.select().from(personalizedPlans).where(
      sql`${personalizedPlans.videoId} = ${videoId} AND ${personalizedPlans.profileId} = ${profileId}`
    );
    return plan;
  }

  async createPersonalizedPlan(insertPlan: InsertPersonalizedPlan): Promise<PersonalizedPlan> {
    const [plan] = await db
      .insert(personalizedPlans)
      .values(insertPlan as any)
      .returning();
    return plan;
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

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
    const existingVideo = this.videos.get(id);
    if (!existingVideo) {
      throw new Error("Video not found");
    }
    
    const updatedVideo = { ...existingVideo, ...updates };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(videoId: string, userId: string): Promise<boolean> {
    const video = this.videos.get(videoId);
    if (!video || video.userId !== userId) {
      return false;
    }
    
    // Delete associated chat messages
    Array.from(this.chatMessages.keys()).forEach(messageId => {
      const message = this.chatMessages.get(messageId);
      if (message && message.videoId === videoId) {
        this.chatMessages.delete(messageId);
      }
    });
    
    // Delete the video
    return this.videos.delete(videoId);
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

  // Prompt configuration operations - not implemented for MemStorage
  async getAllPromptConfigs(): Promise<PromptConfig[]> {
    return [];
  }

  async getPromptConfigsByType(type: "chat" | "summary" | "quick_action"): Promise<PromptConfig[]> {
    return [];
  }

  async getPromptConfig(id: string): Promise<PromptConfig | undefined> {
    return undefined;
  }

  async getActivePromptConfig(): Promise<PromptConfig | undefined> {
    return undefined;
  }

  async getActiveSummaryPromptConfig(): Promise<PromptConfig | undefined> {
    return undefined;
  }

  async getActiveQuickActionPromptConfig(quickActionType: string): Promise<PromptConfig | undefined> {
    return undefined;
  }

  async createPromptConfig(config: InsertPromptConfig): Promise<PromptConfig> {
    throw new Error("In-memory storage doesn't support prompt configurations");
  }

  async updatePromptConfig(id: string, config: UpdatePromptConfig): Promise<PromptConfig | undefined> {
    throw new Error("In-memory storage doesn't support prompt configurations");
  }

  async deletePromptConfig(id: string): Promise<boolean> {
    return false;
  }

  async activatePromptConfig(id: string): Promise<boolean> {
    return false;
  }
  
  // Profile operations - not implemented for MemStorage
  async getUserProfiles(userId: string): Promise<Profile[]> {
    return [];
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return undefined;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    throw new Error("In-memory storage doesn't support profiles");
  }

  async updateProfile(id: string, userId: string, updates: { name?: string; description?: string }): Promise<Profile | undefined> {
    throw new Error("In-memory storage doesn't support profiles");
  }

  async deleteProfile(id: string, userId: string): Promise<boolean> {
    return false;
  }
  
  // Personalized plan operations - not implemented for MemStorage
  async getPersonalizedPlan(videoId: string, profileId: string): Promise<PersonalizedPlan | undefined> {
    return undefined;
  }

  async createPersonalizedPlan(plan: InsertPersonalizedPlan): Promise<PersonalizedPlan> {
    throw new Error("In-memory storage doesn't support personalized plans");
  }
}

export const storage = new DatabaseStorage();
