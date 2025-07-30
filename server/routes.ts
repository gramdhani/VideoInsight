import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema, insertChatMessageSchema } from "@shared/schema";
import { extractYouTubeId, getVideoInfo } from "./services/youtube";
import { summarizeVideo, chatAboutVideo } from "./services/openai";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Analyze YouTube video
  app.post("/api/videos/analyze", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "YouTube URL is required" });
      }
      
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }
      
      // Check if video already exists
      const existingVideo = await storage.getVideo(youtubeId);
      if (existingVideo) {
        return res.json(existingVideo);
      }
      
      // Get video information from YouTube
      const videoInfo = await getVideoInfo(youtubeId);
      
      // Generate AI summary
      const summary = await summarizeVideo(videoInfo.transcript || "", videoInfo.title);
      
      // Create video record
      const video = await storage.createVideo({
        youtubeId,
        title: videoInfo.title,
        channel: videoInfo.channel,
        duration: videoInfo.duration,
        views: videoInfo.views,
        thumbnail: videoInfo.thumbnail,
        transcript: videoInfo.transcript,
        transcriptData: videoInfo.transcriptData,
        summary,
      });
      
      res.json(video);
    } catch (error) {
      console.error("Error analyzing video:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to analyze video" });
    }
  });
  
  // Get video by YouTube ID
  app.get("/api/videos/:youtubeId", async (req, res) => {
    try {
      const { youtubeId } = req.params;
      const video = await storage.getVideo(youtubeId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });
  
  // Chat about video
  app.post("/api/videos/:videoId/chat", async (req, res) => {
    try {
      const { videoId } = req.params;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Get video for context - videoId could be youtubeId or internal ID
      let video = await storage.getVideo(videoId);
      if (!video) {
        // Try to find by internal ID
        video = await storage.getVideoById(videoId);
      }
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Get previous chat messages for context
      const previousMessages = await storage.getChatMessages(video.id);
      const context = previousMessages.map(msg => ({
        question: msg.message,
        answer: msg.response,
      }));
      
      // Generate AI response
      const { answer, timestamps } = await chatAboutVideo(
        message,
        video.transcript || "",
        video.title,
        context
      );
      
      // Save chat message
      const chatMessage = await storage.createChatMessage({
        videoId: video.id,
        message,
        response: answer,
        timestamps,
      });
      
      res.json(chatMessage);
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process chat message" });
    }
  });
  
  // Get chat messages for video
  app.get("/api/videos/:videoId/chat", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      // Get video for context - videoId could be youtubeId or internal ID
      let video = await storage.getVideo(videoId);
      if (!video) {
        // Try to find by internal ID
        video = await storage.getVideoById(videoId);
      }
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      const messages = await storage.getChatMessages(video.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
