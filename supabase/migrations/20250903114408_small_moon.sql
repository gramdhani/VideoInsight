/*
  # Initial VideoInsight AI Database Schema

  1. New Tables
    - `sessions` - Session storage for authentication (required for Replit Auth)
      - `sid` (varchar, primary key)
      - `sess` (jsonb, session data)
      - `expire` (timestamp, expiration time)
    
    - `users` - User accounts and profiles
      - `id` (varchar, primary key)
      - `email` (varchar, unique)
      - `first_name` (varchar)
      - `last_name` (varchar)
      - `profile_image_url` (varchar)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `videos` - YouTube video analysis data
      - `id` (varchar, primary key)
      - `youtube_id` (text, YouTube video ID)
      - `user_id` (varchar, foreign key to users)
      - `title` (text, video title)
      - `channel` (text, channel name)
      - `duration` (text, formatted duration)
      - `views` (text, formatted view count)
      - `thumbnail` (text, thumbnail URL)
      - `transcript` (text, video transcript)
      - `transcript_data` (jsonb, structured transcript with timestamps)
      - `summary` (jsonb, AI-generated summary data)
      - `created_at` (timestamp)
    
    - `chat_messages` - Chat conversations about videos
      - `id` (varchar, primary key)
      - `video_id` (varchar, foreign key to videos)
      - `message` (text, user message)
      - `response` (text, AI response)
      - `timestamps` (jsonb, array of timestamps)
      - `created_at` (timestamp)
    
    - `feedbacks` - User feedback submissions
      - `id` (varchar, primary key)
      - `name` (text, user name)
      - `email` (text, user email)
      - `message` (text, feedback message)
      - `user_id` (varchar, foreign key to users, optional)
      - `created_at` (timestamp)
    
    - `prompt_configs` - AI prompt configurations
      - `id` (varchar, primary key)
      - `name` (text, configuration name)
      - `system_prompt` (text, AI system prompt)
      - `user_prompt` (text, user prompt template)
      - `description` (text, optional description)
      - `type` (text, config type: chat/summary/quick_action)
      - `quick_action_type` (text, specific quick action type)
      - `is_active` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `profiles` - User profiles for personalized plans
      - `id` (varchar, primary key)
      - `user_id` (varchar, foreign key to users)
      - `name` (text, profile name)
      - `description` (text, profile description)
      - `created_at` (timestamp)
    
    - `personalized_plans` - AI-generated personalized action plans
      - `id` (varchar, primary key)
      - `video_id` (varchar, foreign key to videos)
      - `profile_id` (varchar, foreign key to profiles)
      - `plan` (jsonb, structured plan data)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add admin policies for prompt_configs table

  3. Indexes
    - Add index on sessions.expire for performance
    - Add indexes on foreign key columns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table (required for Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Users table (required for Replit Auth)
CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar UNIQUE,
  first_name varchar,
  last_name varchar,
  profile_image_url varchar,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL,
  user_id varchar REFERENCES users(id),
  title text NOT NULL,
  channel text NOT NULL,
  duration text NOT NULL,
  views text NOT NULL,
  thumbnail text NOT NULL,
  transcript text,
  transcript_data jsonb,
  summary jsonb,
  created_at timestamptz DEFAULT now()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id varchar REFERENCES videos(id) NOT NULL,
  message text NOT NULL,
  response text NOT NULL,
  timestamps jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  user_id varchar REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Prompt configs table
CREATE TABLE IF NOT EXISTS prompt_configs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  system_prompt text NOT NULL,
  user_prompt text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'chat',
  quick_action_type text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar REFERENCES users(id),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Personalized plans table
CREATE TABLE IF NOT EXISTS personalized_plans (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id varchar REFERENCES videos(id) NOT NULL,
  profile_id varchar REFERENCES profiles(id) NOT NULL,
  plan jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id);

-- RLS Policies for videos table
CREATE POLICY "Users can read own videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own videos"
  ON videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own videos"
  ON videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own videos"
  ON videos
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for chat_messages table
CREATE POLICY "Users can read chat messages for own videos"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = chat_messages.video_id 
      AND videos.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create chat messages for own videos"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = chat_messages.video_id 
      AND videos.user_id = auth.uid()::text
    )
  );

-- RLS Policies for feedbacks table
CREATE POLICY "Users can create feedback"
  ON feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own feedback"
  ON feedbacks
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for prompt_configs table (admin only)
CREATE POLICY "Admins can manage prompt configs"
  ON prompt_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()::text 
      AND users.is_admin = true
    )
  );

-- RLS Policies for profiles table
CREATE POLICY "Users can read own profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- RLS Policies for personalized_plans table
CREATE POLICY "Users can read own personalized plans"
  ON personalized_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = personalized_plans.video_id 
      AND videos.user_id = auth.uid()::text
    )
    AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = personalized_plans.profile_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can create personalized plans for own data"
  ON personalized_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = personalized_plans.video_id 
      AND videos.user_id = auth.uid()::text
    )
    AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = personalized_plans.profile_id 
      AND profiles.user_id = auth.uid()::text
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_youtube_id ON videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_video_id ON chat_messages(video_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_plans_video_id ON personalized_plans(video_id);
CREATE INDEX IF NOT EXISTS idx_personalized_plans_profile_id ON personalized_plans(profile_id);