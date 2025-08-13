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
*   **AI Models:** OpenAI GPT-4o-mini (all AI processing) via OpenRouter API.

**Key Architectural Decisions & Features:**
*   **Database Schema:** Utilizes `videos` and `chat_messages` tables. The `videos` table stores structured AI summaries in JSONB format, including short summaries, outlines, key takeaways, and actionable steps with priority badges.
*   **AI Integration:** Unified AI system using OpenAI GPT-4o-mini via OpenRouter for all processing - generates structured video summaries, conversational responses, and provides general knowledge context when questions require market information (competitors, pricing, etc.). AI responses combine video insights with general knowledge when relevant, formatted for readability with proper markdown and contextual intelligence.
*   **User Interface:** Features a modern violet/purple color scheme with a clean design aesthetic, rounded corners, and shadows. It includes a collapsible sidebar for desktop navigation and comprehensive mobile responsiveness with a mobile-first navigation approach.
*   **Video Analysis Flow:** Users submit a YouTube URL, triggering the backend to extract metadata, obtain transcripts, and generate structured summaries which are then stored and displayed on the frontend.
*   **Chat Interaction Flow:** Users can submit questions about video content, with the backend sending the question and video context to the AI. AI responses include relevant timestamps, and chat messages are stored and displayed.
*   **State Management:** TanStack Query handles API state and caching, with React hooks managing local component state and optimistic updates for enhanced user experience.
*   **Freemium Model:** Allows all users to analyze videos and access AI summaries and transcripts. Authentication is primarily required for interactive chat features.
*   **Authentication:** Integrates Replit OpenID Connect for user session management with PostgreSQL session storage.

## External Dependencies

*   **Database:** PostgreSQL (specifically Neon serverless) via `@neondatabase/serverless` and `drizzle-orm`.
*   **AI Services:** OpenRouter API (using `openai/gpt-4o-mini` model) for AI-powered video analysis and chat.
*   **Video Metadata:** YouTube Data API v3 for fetching video metadata.
*   **Environment Variables:** Requires `DATABASE_URL`, `OPENROUTER_API_KEY`, and `YOUTUBE_API_KEY`.

## Recent Updates & Changelog

### January 2025 - AI Prompt Configuration System

**✓ Dynamic Prompt Management**
*   Added web-based interface for managing AI chat prompts at `/settings`
*   Database-backed prompt configurations with create, read, update, delete operations
*   Support for multiple prompt configurations with activation system
*   Template variable system for dynamic content injection (${context}, ${transcript}, ${videoDuration}, ${question}, ${title}, ${webSearchInfo})
*   Real-time prompt switching without code changes
*   Default configurations provided for standard and concise response modes

**✓ Settings Page Features**
*   Authentication-protected admin interface for prompt management
*   Visual prompt editor with syntax highlighting for system and user prompts
*   Template variable documentation and examples
*   One-click activation to switch between different prompt configurations
*   Copy-to-clipboard functionality for sharing prompt templates

**✓ Technical Implementation**
*   Added `prompt_configs` table to PostgreSQL database schema
*   RESTful API endpoints for prompt configuration CRUD operations
*   Integration with existing OpenAI service to use active prompt configuration
*   Fallback to default prompts if no configuration is active

### August 2025 - Unified AI Model Migration

**✓ Migrated from Gemini to OpenAI Model via OpenRouter**
*   Replaced Google Gemini 2.5 Flash Lite with OpenAI GPT-4o-mini for all AI processing
*   Maintained OpenRouter API for cost-effective access to OpenAI models
*   Unified video summarization, chat responses, and general knowledge context under openai/gpt-4o-mini
*   Kept OPENROUTER_API_KEY requirement for consistent API access
*   Updated web search simulation using openai/gpt-4o-mini general knowledge
*   Fixed Gemini seed parameter compatibility errors by switching to OpenAI model

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

### January 2025 - Personalized Action Plan Feature

**✓ User Profile System**
*   Added profile creation with text descriptions (e.g., "I'm a Webflow freelancer with 2 years of experience")
*   Database-backed profile storage with CRUD operations
*   Profile management page at `/profile` with create, view, and delete functionality
*   Display name extracted from first part of description for easy identification

**✓ Personalized Plan Generation**
*   Added "Personalized Plan" tab to video summary interface
*   Profile selector dropdown for choosing which profile to use for plan generation
*   AI-powered plan generation using OpenAI to convert video insights into actionable steps
*   Plans tailored to user's specific role, experience level, and goals

**✓ Structured Action Plans**
*   Priority Action Items: 5 specific tasks with titles, explanations, and concrete steps
*   Effort/Impact ratings: Visual badges showing effort level (low/medium/high) and expected impact
*   Measurable metrics: Each item includes specific KPIs with targets and timeframes
*   Suggested deadlines: Realistic completion timelines based on task complexity
*   Quick Wins section: 3 immediate actions users can take for early momentum

**✓ Technical Implementation**
*   Added `profiles` and `personalized_plans` tables to PostgreSQL schema
*   RESTful API endpoints for profile and plan management (GET, POST, PATCH, DELETE)
*   Integration with OpenAI for intelligent plan generation
*   Career coach system prompt for pragmatic, specific action plans
*   Plan caching to avoid regenerating identical plans

**✓ Profile Management Enhancement**
*   Added edit functionality to profile page with edit button on each profile card
*   PATCH `/api/profiles/:id` endpoint for updating profile names and descriptions
*   Edit dialog with pre-filled name and description fields and save/cancel actions
*   Separate profile name field (e.g., "Webflow Freelancer") for better organization
*   User-friendly edit and delete buttons with clear visual indicators
*   Database migration from displayName to dedicated name field