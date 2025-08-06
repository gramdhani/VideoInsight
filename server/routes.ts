import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema, insertChatMessageSchema, insertFeedbackSchema } from "@shared/schema";
import { extractYouTubeId, getVideoInfo } from "./services/youtube";
import { summarizeVideo, chatAboutVideo } from "./services/openai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import webSearchRoutes from "./routes/webSearch";

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
  app.post("/api/videos/analyze", async (req: any, res) => {
    try {
      const { url } = req.body;
      
      // Get userId if user is authenticated, otherwise null
      let userId = null;
      if (req.user && req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      }
      
      if (!url) {
        return res.status(400).json({ message: "YouTube URL is required" });
      }
      
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }
      
      // Check if this video already exists (for authenticated users, check their personal copy)
      let existingVideo;
      if (userId) {
        existingVideo = await storage.getUserVideo(userId, youtubeId);
      } else {
        // For unauthenticated users, check if video exists in general
        existingVideo = await storage.getVideo(youtubeId);
      }
      
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
        userId, // Associate with user if authenticated, otherwise null
      });
      
      res.json(video);
    } catch (error) {
      console.error("Error analyzing video:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to analyze video" });
    }
  });
  
  // Get all videos (requires authentication)
  app.get("/api/videos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const videos = await storage.getUserVideos(userId);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get video by internal ID (requires authentication)
  app.get("/api/videos/id/:videoId", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user.claims.sub;
      const video = await storage.getVideoById(videoId);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Ensure user can only access their own videos
      if (video.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Get video by YouTube ID (accessible to all users)
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
        context,
        video.duration
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
  
  // Delete video (requires authentication)
  app.delete("/api/videos/:videoId", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const userId = req.user.claims.sub;
      
      const deleted = await storage.deleteVideo(videoId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Video not found or unauthorized" });
      }
      
      res.json({ success: true, message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
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

  // Submit feedback (no authentication required)
  app.post("/api/feedback", async (req: any, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      
      // If user is authenticated, add userId to feedback
      let userId = null;
      if (req.user && req.user.claims && req.user.claims.sub) {
        userId = req.user.claims.sub;
      }
      
      const feedbackData = {
        ...validatedData,
        userId,
      };
      
      const feedback = await storage.createFeedback(feedbackData);
      res.json({ success: true, message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to submit feedback" });
    }
  });

  // Add web search routes
  app.use("/api/web", webSearchRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
