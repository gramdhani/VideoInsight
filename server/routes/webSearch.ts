import { Router } from "express";
import { searchWeb, searchWebWithContent } from "../services/webSearch";

const router = Router();

// Simple web search endpoint for testing
router.post("/search", async (req, res) => {
  try {
    const { query, includeContent = false } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    console.log(`Web search request: ${query}`);
    
    let searchResults;
    if (includeContent) {
      searchResults = await searchWebWithContent(query, 3);
    } else {
      searchResults = await searchWeb(query, 5);
    }

    res.json(searchResults);
  } catch (error) {
    console.error("Web search error:", error);
    res.status(500).json({ 
      error: "Failed to search the web",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;