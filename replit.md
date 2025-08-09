# VideoInsight AI - Replit Configuration

## Overview

VideoInsight AI is a full-stack web application that analyzes YouTube videos using AI to provide intelligent summaries, key insights, and interactive chat capabilities. It allows users to input YouTube URLs, extract video information and transcripts, generate AI-powered summaries with key points and "aha moments," and engage in contextual conversations about the video content. The project aims to offer a streamlined solution for understanding and interacting with video content efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.
Response format: Prioritize bullet points over paragraphs, keep responses short and concise.
Note: Uses hybrid AI approach - GPT-4o-mini-search-preview for web research, Gemini for responses.

## System Architecture

The project employs a monorepo structure separating client, server, and shared components.

**Technology Stack:**
*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (with Radix UI), TanStack Query, Wouter.
*   **Backend:** Node.js, Express.js, TypeScript, Drizzle ORM, PostgreSQL (via Neon serverless).
*   **AI Models:** OpenAI GPT-4o-mini (all AI processing) via OpenAI API.

**Key Architectural Decisions & Features:**
*   **Database Schema:** Utilizes `videos` and `chat_messages` tables. The `videos` table stores structured AI summaries in JSONB format, including short summaries, outlines, key takeaways, and actionable steps with priority badges.
*   **AI Integration:** Unified AI system using OpenAI GPT-4o-mini for all processing - generates structured video summaries, conversational responses, and provides general knowledge context when questions require market information (competitors, pricing, etc.). AI responses combine video insights with general knowledge when relevant, formatted for readability with proper markdown and contextual intelligence.
*   **User Interface:** Features a modern violet/purple color scheme with a clean design aesthetic, rounded corners, and shadows. It includes a collapsible sidebar for desktop navigation and comprehensive mobile responsiveness with a mobile-first navigation approach.
*   **Video Analysis Flow:** Users submit a YouTube URL, triggering the backend to extract metadata, obtain transcripts, and generate structured summaries which are then stored and displayed on the frontend.
*   **Chat Interaction Flow:** Users can submit questions about video content, with the backend sending the question and video context to the AI. AI responses include relevant timestamps, and chat messages are stored and displayed.
*   **State Management:** TanStack Query handles API state and caching, with React hooks managing local component state and optimistic updates for enhanced user experience.
*   **Freemium Model:** Allows all users to analyze videos and access AI summaries and transcripts. Authentication is primarily required for interactive chat features.
*   **Authentication:** Integrates Replit OpenID Connect for user session management with PostgreSQL session storage.

## External Dependencies

*   **Database:** PostgreSQL (specifically Neon serverless) via `@neondatabase/serverless` and `drizzle-orm`.
*   **AI Services:** OpenAI API (using `gpt-4o-mini` model) for AI-powered video analysis and chat.
*   **Video Metadata:** YouTube Data API v3 for fetching video metadata.
*   **Environment Variables:** Requires `DATABASE_URL`, `OPENAI_API_KEY`, and `YOUTUBE_API_KEY`.

## Recent Updates & Changelog

### August 2025 - Unified AI Model Migration

**✓ Migrated from Hybrid AI to Single OpenAI Model**
*   Replaced Google Gemini 2.5 Flash Lite with OpenAI GPT-4o-mini for all AI processing
*   Removed OpenRouter API dependency - now using only OpenAI API
*   Unified video summarization, chat responses, and general knowledge context under one model
*   Updated environment variables - removed OPENROUTER_API_KEY requirement
*   Simplified web search simulation using GPT-4o-mini general knowledge instead of real-time search
*   Enhanced error messages and logging to reflect single API architecture

### August 2025 - Enhanced AI Chat System

**✓ Intelligent Web Search Integration**
*   Added automatic detection system for questions requiring current information
*   Web search triggers for keywords: competitors, alternatives, current, latest, pricing, market trends
*   Smart question pattern recognition: "who is...", "what is X doing", "is there a better..."
*   Combines video content with real-time web data when relevant

**✓ Fixed API Integration Issues**
*   Resolved GPT-4o-mini-search-preview temperature parameter compatibility error
*   Stabilized hybrid AI system communication between OpenAI and OpenRouter APIs
*   Improved error handling and fallback mechanisms

**✓ Enhanced Response Formatting**
*   Implemented mandatory bullet point formatting for all AI responses
*   Prioritized concise, scannable content over lengthy paragraphs
*   Added structured formatting with sub-bullets for detailed information
*   Responses now start immediately with bullets (no introductory paragraphs)

**✓ System Architecture Improvements**
*   Enhanced intelligent detection logic with multi-layer keyword analysis
*   Improved context-aware decision making for web search activation
*   Optimized response generation combining video insights with current web data
*   Added visual indicators (🔍) for web search activation in logs

**✓ Context-Aware Quick Questions Feature (August 2025)**
*   Replaced static question templates with AI-generated context-specific questions
*   Added generateQuickQuestions AI service using existing OpenRouter Gemini integration
*   Created GET `/api/videos/:youtubeId/quick-questions` endpoint for dynamic question generation
*   Updated QuickActions component with loading states and error handling
*   Questions now analyze video transcript and title to generate personalized conversation starters
*   Positioned Quick Questions above chat interface for easy access to all users

**✓ Enhanced Quick Questions User Experience (August 2025)**
*   Modified quick questions to trigger immediate AI responses instead of filling input box
*   Reduced question character limit from 120-160 to 40-70 characters for improved readability
*   Implemented click-to-chat functionality for instant video content engagement
*   Added authentication checks with clear error messages for unauthenticated users
*   Enhanced loading states and disabled button interactions during AI processing
*   Questions now appear directly in chat interface when no previous messages exist