# VideoInsight AI - Replit Configuration

## Overview

VideoInsight AI is a full-stack web application for analyzing YouTube videos using AI to provide intelligent summaries, key insights, and interactive chat capabilities. It allows users to input YouTube URLs, extract video information and transcripts, generate AI-powered summaries with key points and "aha moments," and engage in contextual conversations about the video content. The project aims to offer a streamlined solution for understanding and interacting with video content efficiently, with a business vision to offer a powerful tool for content creators, researchers, and learners to quickly digest and leverage video information.

## User Preferences

Preferred communication style: Simple, everyday language.
Response format: Prioritize bullet points over paragraphs, keep responses short and concise.

## System Architecture

The project employs a monorepo structure separating client, server, and shared components.

**Technology Stack:**
*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (with Radix UI), TanStack Query, Wouter.
*   **Backend:** Node.js, Express.js, TypeScript, Drizzle ORM, PostgreSQL.
*   **AI Models:** OpenAI GPT-4o-mini (all AI processing) via OpenRouter API.

**Key Architectural Decisions & Features:**
*   **Database Schema:** Utilizes `videos`, `chat_messages`, `prompt_configs`, `profiles`, and `personalized_plans` tables. The `videos` table stores structured AI summaries in JSONB format, including short summaries, outlines, key takeaways, and actionable steps with priority badges.
*   **AI Integration:** A unified AI system using OpenAI GPT-4o-mini via OpenRouter for all processing. This includes generating structured video summaries, conversational responses, providing general knowledge context when questions require market information (competitors, pricing, etc.), and generating personalized action plans and context-aware quick questions. AI responses combine video insights with general knowledge when relevant, formatted for readability with proper markdown and contextual intelligence.
*   **Prompt Configuration System:** A web-based interface allows dynamic management of AI chat and summary prompts, supporting multiple configurations with activation and template variable injection.
*   **User Interface:** Features a modern violet/purple color scheme with a clean design aesthetic, rounded corners, and shadows. It includes a collapsible sidebar for desktop navigation and comprehensive mobile responsiveness with a mobile-first navigation approach, optimized for touch targets, safe areas, and performance.
*   **Video Analysis Flow:** Users submit a YouTube URL, triggering the backend to extract metadata, obtain transcripts, and generate structured summaries which are then stored and displayed on the frontend.
*   **Chat Interaction Flow:** Users can submit questions about video content, with the backend sending the question and video context to the AI. AI responses include relevant timestamps (clickable inline), and chat messages are stored and displayed. The system includes intelligent web search integration for questions requiring current information.
*   **Clickable Video Navigation:** Video outlines include clickable timestamps that allow users to jump directly to specific sections of the video. Timestamps are generated from real transcript data to ensure accuracy, and clicking them automatically scrolls the page to the video player for immediate viewing.
*   **Quick Actions System:** Configurable quick action buttons trigger dynamic AI responses based on user-defined prompts, such as "Shorter Summary," "Detailed Analysis," "Action Items," and "Key Quotes."
*   **Personalized Action Plans:** Users can create profiles (e.g., "Webflow freelancer") which the AI uses to generate tailored action plans from video insights. These plans include priority action items with effort/impact ratings, measurable metrics, suggested deadlines, and quick wins.
*   **Authentication:** Integrates Replit OpenID Connect for user session management with PostgreSQL session storage, primarily required for interactive chat features.
*   **State Management:** TanStack Query handles API state and caching, with React hooks managing local component state and optimistic updates.

## External Dependencies

*   **Database:** PostgreSQL (specifically Neon serverless) via `@neondatabase/serverless` and `drizzle-orm`.
*   **AI Services:** OpenRouter API (using `openai/gpt-4o-mini` model) for all AI-powered video analysis and chat.
*   **Video Metadata:** YouTube Data API v3 for fetching video metadata.
*   **Environment Variables:** Requires `DATABASE_URL`, `OPENROUTER_API_KEY`, and `YOUTUBE_API_KEY`.