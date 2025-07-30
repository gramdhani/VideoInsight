import { type Video, type InsertVideo, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getVideo(youtubeId: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  getChatMessages(videoId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private videos: Map<string, Video>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.videos = new Map();
    this.chatMessages = new Map();
  }

  async getVideo(youtubeId: string): Promise<Video | undefined> {
    return Array.from(this.videos.values()).find(
      (video) => video.youtubeId === youtubeId,
    );
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = randomUUID();
    const video: Video = { 
      id,
      youtubeId: insertVideo.youtubeId,
      title: insertVideo.title,
      channel: insertVideo.channel,
      duration: insertVideo.duration,
      views: insertVideo.views,
      thumbnail: insertVideo.thumbnail,
      transcript: insertVideo.transcript || null,
      transcriptData: Array.isArray(insertVideo.transcriptData) ? insertVideo.transcriptData : null,
      summary: insertVideo.summary || null,
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
      timestamps: Array.isArray(insertMessage.timestamps) ? insertMessage.timestamps : null,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
