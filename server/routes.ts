import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVideoSchema, insertChatMessageSchema, insertFeedbackSchema, insertProfileSchema, insertPersonalizedPlanSchema } from "@shared/schema";
import { extractYouTubeId, getVideoInfo } from "./services/youtube";
import { summarizeVideo, chatAboutVideo, generateQuickQuestions } from "./services/openai";
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

  // Generate context-aware quick questions for video (accessible to all users)
  app.get("/api/videos/:youtubeId/quick-questions", async (req, res) => {
    try {
      const { youtubeId } = req.params;
      
      // Get video data - youtubeId could be youtubeId or internal ID
      let video = await storage.getVideo(youtubeId);
      if (!video) {
        // Try to find by internal ID
        video = await storage.getVideoById(youtubeId);
      }
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (!video.transcript) {
        return res.status(400).json({ message: "Video transcript not available" });
      }
      
      // Generate context-aware questions using AI
      const questions = await generateQuickQuestions(video.transcript, video.title);
      
      res.json({ questions });
    } catch (error) {
      console.error("Error generating quick questions:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate quick questions" });
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

  // Prompt configuration endpoints (requires authentication)
  
  // Get all prompt configurations
  app.get("/api/admin/prompt-configs", isAuthenticated, async (req, res) => {
    try {
      const configs = await storage.getAllPromptConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching prompt configs:", error);
      res.status(500).json({ message: "Failed to fetch prompt configurations" });
    }
  });

  // Get active prompt configuration
  app.get("/api/admin/prompt-configs/active", async (req, res) => {
    try {
      const config = await storage.getActivePromptConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching active prompt config:", error);
      res.status(500).json({ message: "Failed to fetch active prompt configuration" });
    }
  });

  // Create new prompt configuration
  app.post("/api/admin/prompt-configs", isAuthenticated, async (req, res) => {
    try {
      const { insertPromptConfigSchema } = await import("@shared/schema");
      const validatedData = insertPromptConfigSchema.parse(req.body);
      const config = await storage.createPromptConfig(validatedData);
      res.json(config);
    } catch (error) {
      console.error("Error creating prompt config:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create prompt configuration" });
    }
  });

  // Update prompt configuration
  app.put("/api/admin/prompt-configs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { updatePromptConfigSchema } = await import("@shared/schema");
      const validatedData = updatePromptConfigSchema.parse(req.body);
      const config = await storage.updatePromptConfig(id, validatedData);
      
      if (!config) {
        return res.status(404).json({ message: "Prompt configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error updating prompt config:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update prompt configuration" });
    }
  });

  // Delete prompt configuration
  app.delete("/api/admin/prompt-configs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePromptConfig(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Prompt configuration not found" });
      }
      
      res.json({ success: true, message: "Prompt configuration deleted successfully" });
    } catch (error) {
      console.error("Error deleting prompt config:", error);
      res.status(500).json({ message: "Failed to delete prompt configuration" });
    }
  });

  // Activate prompt configuration
  app.post("/api/admin/prompt-configs/:id/activate", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const activated = await storage.activatePromptConfig(id);
      
      if (!activated) {
        return res.status(404).json({ message: "Prompt configuration not found" });
      }
      
      res.json({ success: true, message: "Prompt configuration activated successfully" });
    } catch (error) {
      console.error("Error activating prompt config:", error);
      res.status(500).json({ message: "Failed to activate prompt configuration" });
    }
  });

  // Profile endpoints (requires authentication)
  
  // Get user profiles
  app.get("/api/profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profiles = await storage.getUserProfiles(userId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Create new profile
  app.post("/api/profiles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { description } = req.body;
      
      if (!description || description.trim().length === 0) {
        return res.status(400).json({ message: "Profile description is required" });
      }
      
      // Generate display name from first part of description (first 50 chars or until punctuation)
      const displayName = description
        .substring(0, 50)
        .split(/[.!?]/)[0]
        .trim() || description.substring(0, 30) + "...";
      
      const profileData = insertProfileSchema.parse({
        userId,
        description,
        displayName,
      });
      
      const profile = await storage.createProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create profile" });
    }
  });

  // Delete profile
  app.delete("/api/profiles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const deleted = await storage.deleteProfile(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Profile not found or access denied" });
      }
      
      res.json({ success: true, message: "Profile deleted successfully" });
    } catch (error) {
      console.error("Error deleting profile:", error);
      res.status(500).json({ message: "Failed to delete profile" });
    }
  });

  // Update profile
  app.patch("/api/profiles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { description } = req.body;
      
      if (!description || description.trim().length === 0) {
        return res.status(400).json({ message: "Profile description is required" });
      }
      
      // Generate display name from first part of description (first 50 chars or until punctuation)
      const displayName = description
        .substring(0, 50)
        .split(/[.!?]/)[0]
        .trim() || description.substring(0, 30) + "...";
      
      const updated = await storage.updateProfile(id, userId, { description, displayName });
      
      if (!updated) {
        return res.status(404).json({ message: "Profile not found or access denied" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to update profile" });
    }
  });

  // Personalized plan endpoints
  
  // Get personalized plan for a video and profile
  app.get("/api/videos/:videoId/plans/:profileId", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId, profileId } = req.params;
      const plan = await storage.getPersonalizedPlan(videoId, profileId);
      
      if (!plan) {
        return res.status(404).json({ message: "Personalized plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error fetching personalized plan:", error);
      res.status(500).json({ message: "Failed to fetch personalized plan" });
    }
  });

  // Generate personalized plan
  app.post("/api/videos/:videoId/plans", isAuthenticated, async (req: any, res) => {
    try {
      const { videoId } = req.params;
      const { profileId } = req.body;
      
      if (!profileId) {
        return res.status(400).json({ message: "Profile ID is required" });
      }
      
      // Check if plan already exists
      const existingPlan = await storage.getPersonalizedPlan(videoId, profileId);
      if (existingPlan) {
        return res.json(existingPlan);
      }
      
      // Get video and profile
      const [video, profile] = await Promise.all([
        storage.getVideoById(videoId),
        storage.getProfile(profileId),
      ]);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Generate personalized plan using AI
      const { generatePersonalizedPlan } = await import("./services/openai");
      const planData = await generatePersonalizedPlan(
        video.transcript || "",
        video.summary,
        profile.description
      );
      
      // Save plan
      const plan = await storage.createPersonalizedPlan({
        videoId,
        profileId,
        plan: planData,
      });
      
      res.json(plan);
    } catch (error) {
      console.error("Error generating personalized plan:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate personalized plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
