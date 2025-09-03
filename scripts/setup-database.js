// Database setup script for production migration

const fs = require("fs")
const path = require("path")

// Supabase setup
const supabaseSetup = `
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table
CREATE TABLE tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  album VARCHAR(255),
  image TEXT,
  duration VARCHAR(10),
  preview_url TEXT,
  genre VARCHAR(100),
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlists table
CREATE TABLE playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playlist tracks junction table
CREATE TABLE playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liked tracks table
CREATE TABLE liked_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, track_id)
);

-- Indexes for better performance
CREATE INDEX idx_tracks_artist ON tracks(artist);
CREATE INDEX idx_tracks_title ON tracks(title);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
CREATE INDEX idx_liked_tracks_user_id ON liked_tracks(user_id);
`

// MongoDB setup
const mongoSetup = `
// MongoDB Collections Setup

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": 1 })

// Tracks collection
db.tracks.createIndex({ "title": "text", "artist": "text", "album": "text" })
db.tracks.createIndex({ "artist": 1 })
db.tracks.createIndex({ "genre": 1 })
db.tracks.createIndex({ "year": 1 })

// Playlists collection
db.playlists.createIndex({ "userId": 1 })
db.playlists.createIndex({ "isPublic": 1 })
db.playlists.createIndex({ "createdAt": 1 })

// Sample documents
db.users.insertOne({
  email: "demo@vibestream.com",
  name: "Demo User",
  avatar: null,
  playlists: [],
  likedTracks: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
`

console.log("Database setup scripts generated!")
console.log("Supabase SQL saved to: supabase-setup.sql")
console.log("MongoDB setup saved to: mongodb-setup.js")

fs.writeFileSync(path.join(__dirname, "supabase-setup.sql"), supabaseSetup)
fs.writeFileSync(path.join(__dirname, "mongodb-setup.js"), mongoSetup)
