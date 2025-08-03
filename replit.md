# VideoInsight AI - Replit Configuration

## Overview

VideoInsight AI is a full-stack web application that analyzes YouTube videos using AI to provide intelligent summaries, key insights, and interactive chat capabilities. The application allows users to input YouTube URLs, extract video information and transcripts, generate AI-powered summaries with key points and "aha moments," and engage in contextual conversations about the video content.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 3, 2025 - v0.2.8 OpenRouter Integration with Gemini Model:**
- Migrated from OpenAI API directly to OpenRouter API for cost efficiency
- Switched to google/gemini-2.5-flash-lite-preview-06-17 model for improved reliability
- Updated OpenAI service configuration to use OpenRouter's unified API endpoint
- Added proper OpenRouter headers for app attribution and rankings
- Maintained all existing functionality while reducing operational costs
- Updated environment variable requirement from OPENAI_API_KEY to OPENROUTER_API_KEY
- Added better timeout handling and user-friendly error messages for free model limitations

**August 1, 2025 - v0.2.7 Video Navigation & Chat Auto-scroll:**
- Fixed video library routing issue where clicking videos opened incorrect content
- Updated API endpoints to properly fetch videos by internal ID rather than YouTube ID
- Resolved chat message display problem where messages weren't appearing in UI
- Added automatic scroll-to-bottom functionality for chat interface
- Chat now scrolls to latest message when opening videos with existing history
- Chat automatically scrolls to bottom when sending new messages
- Improved user experience with seamless video switching and chat navigation
- Updated sidebar version display to automatically match latest changelog version

**August 1, 2025 - v0.2.6 AI Response Formatting & Contextual Intelligence:**
- Fixed broken AI markdown formatting caused by malformed JSON responses
- Added text sanitization to remove JSON artifacts from AI responses
- Enhanced server-side JSON parsing with manual extraction fallback
- Updated AI system prompts to avoid problematic characters in responses
- Improved markdown parser to handle escaped characters and HTML tags
- Made AI responses more contextually intelligent - uses paragraphs vs bullet points appropriately
- Enhanced AI to only include timestamps when directly relevant to the question
- Improved creative question handling to generate inspired ideas rather than just video references
- Added comprehensive error handling for AI response processing
- Strengthened formatting rules to prevent quote and brace conflicts

**August 1, 2025 - v0.2.5 Feedback System Implementation:**
- Added comprehensive Share Feedback page with Name, Email, and Message fields
- Email auto-fills for authenticated users and is required for guest submissions
- Created feedback database table with proper schema relations and user associations
- Implemented feedback API endpoint supporting both authenticated and guest access
- Added Share Feedback navigation link in sidebar with MessageSquare icon
- Success confirmation page with option to submit additional feedback
- Added app version indicator (v0.2.5) at bottom of sidebar with 12px font size
- Updated changelog with complete version history from v0.2.0 to v0.2.5

**January 31, 2025 - v0.2.4 Desktop Layout & AI Model Optimization:**
- Switched AI model from GPT-4o to GPT-4o-mini to reduce operational costs
- Fixed desktop chat header cutoff on large monitors with adjusted sticky positioning
- Enhanced timestamp parsing to support range formats like "5:01 - 6:35"
- Improved chat container height calculations for better large screen compatibility
- Fixed mobile sticky positioning issues with proper CSS media queries

**January 31, 2025 - v0.2.3 Timestamp Navigation:**
- Implemented timestamp clicking functionality with YouTube iframe re-rendering
- Enhanced markdown parser to support clickable timestamps with callback handlers
- Added proper timestamp parsing for MM:SS and HH:MM:SS formats
- Fixed mobile chat card cut-off with improved spacing and safe areas
- Updated video player to reload iframe with start time parameter for reliable seeking

**January 31, 2025 - v0.2.2 Mobile Optimization:**
- Implemented comprehensive mobile responsiveness across all components
- Added mobile-first navigation with collapsible sidebar menu
- Optimized chat interface with mobile-friendly sizing and spacing
- Enhanced tabbed content with responsive text and button sizing
- Updated URL input form with mobile-optimized layout
- Added mobile-specific CSS utilities for touch targets and scrolling
- Improved header with shortened branding and mobile navigation
- Enhanced video player and footer with mobile-responsive layouts
- Added mobile-specific breakpoints using existing useIsMobile hook

**January 31, 2025 - v0.1.1 User Experience Improvements:**
- Fixed markdown rendering to properly display HTML tags like &lt;strong&gt;
- Added working PDF export functionality for video summaries using jsPDF
- Enhanced timestamp display with inline clickable elements in chat responses
- Moved Export Notes inside AI Summary card for better organization
- Relocated Quick Actions to chat interface for easier access
- Made chat interface sticky on top for better navigation
- Enhanced chat flow to show user messages immediately
- Updated complete UI design with modern violet/purple color scheme
- Implemented clean design aesthetic with improved rounded corners and shadows
- Enhanced button styling with subtle hover effects and improved accessibility
- Updated card components with cleaner borders and modern spacing
- Improved text contrast and color consistency throughout the interface
- Added modern CSS utility classes for consistent styling across components
- Redesigned navigation with collapsible sidebar layout for desktop users
- Added comprehensive Help page with getting started guide and support information
- Maintained mobile-optimized header navigation while adding desktop sidebar

**January 30, 2025 - v0.2.1 Freemium Model Implementation:**
- Implemented freemium homepage experience allowing all users to analyze videos
- Unlocked AI summary and transcript access for unauthenticated users
- Added authentication paywall specifically for interactive chat features only
- Made chat interface sticky on top of right column for better UX
- Updated API routes to support both authenticated and unauthenticated access patterns
- Created blurred preview paywall component for premium features

**January 30, 2025 - v0.2.0 Authentication Integration:**
- Integrated Replit OpenID Connect authentication system
- Added user session management with PostgreSQL session storage
- Implemented authentication-aware routing (Landing page for unauthenticated users)
- Created user authentication hooks and utilities for frontend
- Added protected API routes requiring user authentication
- Enhanced header component with user profile dropdown and logout functionality
- Updated database schema with users and sessions tables
- Switched from in-memory storage to DatabaseStorage for production readiness

**January 30, 2025 - v0.1.0 Initial Release:**
- Added YouTube URL analysis with real-time transcript extraction using ScrapeCreators API
- Implemented AI-powered video summaries with key insights and "aha moments"
- Created tabbed interface with "AI Summary" and "Transcript" tabs
- Built interactive chat interface for video Q&A with clickable timestamps
- Added functional Quick Actions for instant analysis (Shorter Summary, Detailed Analysis, Action Items, Key Quotes)
- Enhanced AI responses with proper markdown formatting and clickable links
- Implemented two-column layout with professional Indigo/Purple design theme
- Added changelog page to track features and improvements

## System Architecture

### Monorepo Structure
The project follows a monorepo architecture with clear separation between client, server, and shared components:

- **client/**: React frontend application with TypeScript
- **server/**: Express.js backend API with TypeScript
- **shared/**: Common schemas and types shared between frontend and backend
- **migrations/**: Database migration files (Drizzle ORM)

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling and development server
- Tailwind CSS for styling
- shadcn/ui component library with Radix UI primitives
- TanStack Query for state management and API calls
- Wouter for lightweight routing

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- Drizzle ORM for database operations
- PostgreSQL as the primary database (via Neon serverless)
- In-memory storage fallback for development

**External Services:**
- OpenRouter API for AI-powered video analysis and chat (using Google Gemini model)
- YouTube Data API v3 for video metadata extraction

## Key Components

### Database Schema (shared/schema.ts)
Two main tables define the data structure:

1. **videos table**: Stores YouTube video metadata, transcripts, and AI-generated summaries
2. **chat_messages table**: Stores user questions and AI responses for each video

The summary field uses JSONB to store structured data including key points, aha moments, reading time, and insights count.

### Backend Services

**YouTube Service (server/services/youtube.ts):**
- Extracts YouTube video IDs from URLs
- Fetches video metadata using YouTube Data API
- Handles transcript extraction (placeholder for transcript service integration)
- Formats duration and view count data

**OpenAI Service (server/services/openai.ts):**
- Generates structured video summaries using Google Gemini model via OpenRouter
- Provides conversational AI for video-related questions
- Uses JSON response format for consistent data structure
- Maintains conversation context for improved responses

**Storage Layer (server/storage.ts):**
- Implements abstraction layer for data persistence
- Includes both in-memory storage (development) and database storage interfaces
- Supports video creation/retrieval and chat message management

### Frontend Components

**Core Components:**
- **UrlInput**: Handles YouTube URL submission and video analysis initiation
- **VideoPlayer**: Embeds YouTube videos with metadata display
- **SummaryCard**: Displays AI-generated insights and key points
- **ChatInterface**: Provides interactive Q&A about video content
- **NotesExport**: Allows users to export summaries and chat history
- **QuickActions**: Offers rapid analysis options

**UI Foundation:**
- Comprehensive shadcn/ui component library
- Consistent design system with CSS custom properties
- Responsive design with mobile-first approach
- Dark mode support built into the design tokens

## Data Flow

1. **Video Analysis Flow:**
   - User submits YouTube URL
   - Backend extracts video ID and fetches metadata
   - Transcript is obtained (placeholder for transcript service)
   - OpenAI generates structured summary
   - Video record is created in database
   - Frontend displays embedded video and summary

2. **Chat Interaction Flow:**
   - User submits question about video
   - Backend sends question with video context to OpenAI
   - AI response includes relevant timestamps
   - Chat message is stored in database
   - Frontend updates chat interface with new exchange

3. **State Management:**
   - TanStack Query handles API state and caching
   - React hooks manage local component state
   - Optimistic updates for improved user experience

## External Dependencies

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (Neon serverless)
- `OPENROUTER_API_KEY`: OpenRouter API authentication for AI services
- `YOUTUBE_API_KEY`: YouTube Data API v3 key

### Key External Libraries
- `@neondatabase/serverless`: Database connectivity
- `drizzle-orm`: Type-safe database operations
- `openai`: Official OpenAI API client
- `@tanstack/react-query`: Data fetching and state management
- `@radix-ui/*`: Accessible UI primitives
- `tailwindcss`: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- Vite development server with HMR for frontend
- Express server with tsx for TypeScript execution
- In-memory storage fallback when database unavailable
- Integrated error overlay for debugging

### Production Build Process
1. Frontend: Vite builds optimized React bundle to `dist/public`
2. Backend: esbuild compiles TypeScript server to `dist/index.js`
3. Static files served by Express in production mode
4. Database migrations applied via Drizzle Kit

### Environment Configuration
- Development: NODE_ENV=development with live reloading
- Production: NODE_ENV=production with optimized builds
- Database: Automatic fallback to in-memory storage for development
- API Keys: Environment variable validation with fallbacks

The architecture prioritizes developer experience with hot reloading, type safety, and clear separation of concerns while maintaining production readiness with optimized builds and proper error handling.