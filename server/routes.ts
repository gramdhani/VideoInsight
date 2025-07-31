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
  
  // Analyze YouTube video (accessible to all users)
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
        // If user is authenticated and video has no user, associate it
        if (req.isAuthenticated && req.isAuthenticated() && !existingVideo.userId) {
          const userId = (req as any).user.claims.sub;
          // Update the existing video with user association
          await storage.updateVideoUser(existingVideo.id, userId);
          existingVideo.userId = userId;
        }
        return res.json(existingVideo);
      }
      
      // Get video information from YouTube
      const videoInfo = await getVideoInfo(youtubeId);
      
      // Generate AI summary
      const summary = await summarizeVideo(videoInfo.transcript || "", videoInfo.title);
      
      // Create video record with user association if authenticated
      let userId = null;
      if (req.isAuthenticated && req.isAuthenticated()) {
        userId = (req as any).user.claims.sub;
      }
      
      const video = await storage.createVideo({
        youtubeId,
        userId,
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

  // Get user's videos (requires authentication)
  app.get("/api/videos/user", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const videos = await storage.getUserVideos(userId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching user videos:", error);
      res.status(500).json({ message: "Failed to fetch user videos" });
    }
  });

  // Get video by internal ID (accessible to all users)
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let video = await storage.getVideoById(id);
      
      // If not found by ID, try YouTube ID for backwards compatibility
      if (!video) {
        video = await storage.getVideo(id);
      }
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Get chat messages for a video (accessible to all users for now)
  app.get("/api/chat/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      // Get video for context - videoId could be youtubeId or internal ID
      let video = await storage.getVideoById(videoId);
      if (!video) {
        video = await storage.getVideo(videoId);
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
  
  // Get video by YouTube ID (accessible to all users) - deprecated, use /api/videos/:id
  app.get("/api/videos/youtube/:youtubeId", async (req, res) => {
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
  
  // Chat about video (requires authentication)
  app.post("/api/videos/:videoId/chat", isAuthenticated, async (req, res) => {
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
  
  // Get chat messages for video (requires authentication)
  app.get("/api/videos/:videoId/chat", isAuthenticated, async (req, res) => {
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
