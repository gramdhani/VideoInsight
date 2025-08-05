# VideoInsight AI - Replit Configuration

## Overview

VideoInsight AI is a full-stack web application that analyzes YouTube videos using AI to provide intelligent summaries, key insights, and interactive chat capabilities. It allows users to input YouTube URLs, extract video information and transcripts, generate AI-powered summaries with key points and "aha moments," and engage in contextual conversations about the video content. The project aims to offer a streamlined solution for understanding and interacting with video content efficiently.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The project employs a monorepo structure separating client, server, and shared components.

**Technology Stack:**
*   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (with Radix UI), TanStack Query, Wouter.
*   **Backend:** Node.js, Express.js, TypeScript, Drizzle ORM, PostgreSQL (via Neon serverless).
*   **AI Model:** Google Gemini via OpenRouter API.

**Key Architectural Decisions & Features:**
*   **Database Schema:** Utilizes `videos` and `chat_messages` tables. The `videos` table stores structured AI summaries in JSONB format, including short summaries, outlines, key takeaways, and actionable steps with priority badges.
*   **AI Integration:** Generates structured video summaries and provides conversational AI, maintaining context for improved responses. AI responses are formatted to ensure readability, proper markdown, and contextual intelligence (e.g., including timestamps only when relevant).
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
*   **Environment Variables:** Requires `DATABASE_URL`, `OPENROUTER_API_KEY`, and `YOUTUBE_API_KEY`.