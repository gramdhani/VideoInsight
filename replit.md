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
*   **AI Models:** Google Gemini 2.5 Flash Lite (primary responses) via OpenRouter API, GPT-4o-mini-search-preview (web research) via OpenAI API.

**Key Architectural Decisions & Features:**
*   **Database Schema:** Utilizes `videos` and `chat_messages` tables. The `videos` table stores structured AI summaries in JSONB format, including short summaries, outlines, key takeaways, and actionable steps with priority badges.
*   **AI Integration:** Hybrid AI system - Gemini generates structured video summaries and conversational responses, while GPT-4o-mini-search-preview handles web research when questions require current information (competitors, pricing, etc.). AI responses combine video insights with current web data when relevant, formatted for readability with proper markdown and contextual intelligence.
*   **User Interface:** Features a modern violet/purple color scheme with a clean design aesthetic, rounded corners, and shadows. It includes a collapsible sidebar for desktop navigation and comprehensive mobile responsiveness with a mobile-first navigation approach.
*   **Video Analysis Flow:** Users submit a YouTube URL, triggering the backend to extract metadata, obtain transcripts, and generate structured summaries which are then stored and displayed on the frontend.
*   **Chat Interaction Flow:** Users can submit questions about video content, with the backend sending the question and video context to the AI. AI responses include relevant timestamps, and chat messages are stored and displayed.
*   **State Management:** TanStack Query handles API state and caching, with React hooks managing local component state and optimistic updates for enhanced user experience.
*   **Freemium Model:** Allows all users to analyze videos and access AI summaries and transcripts. Authentication is primarily required for interactive chat features.
*   **Authentication:** Integrates Replit OpenID Connect for user session management with PostgreSQL session storage.

## External Dependencies

*   **Database:** PostgreSQL (specifically Neon serverless) via `@neondatabase/serverless` and `drizzle-orm`.
*   **AI Services:** OpenRouter API (using `google/gemini-2.5-flash-lite-preview-06-17` model) for AI-powered video analysis and chat.
*   **Video Metadata:** YouTube Data API v3 for fetching video metadata.
*   **Environment Variables:** Requires `DATABASE_URL`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, and `YOUTUBE_API_KEY`.

## Recent Updates & Changelog

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