#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up Auraluxe for production...\n")

// Create production environment file
const prodEnv = `# Production Environment Variables for Auraluxe

# Database - Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auraluxe?retryWrites=true&w=majority

# JWT Secret - Generate a secure random string (32+ characters)
JWT_SECRET=your-production-jwt-secret-key-minimum-32-characters

# API Keys - Get these from respective services
LASTFM_API_KEY=your-lastfm-api-key-from-last.fm/api
DEEZER_API_KEY=your-deezer-api-key-if-needed
YOUTUBE_API_KEY=AIzaSyByFLH-DUWScupIA666ib6J-tRQ09gPsoc

# Server Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
`

fs.writeFileSync(".env.production", prodEnv)
console.log("✅ Created .env.production file")

// Create deployment scripts
const deployScript = `#!/bin/bash

echo "🚀 Deploying Auraluxe to production..."

# Build the application
echo "📦 Building application..."
npm run build

# Start the server
echo "🌟 Starting production server..."
NODE_ENV=production npm start
`

fs.writeFileSync("deploy.sh", deployScript)
fs.chmodSync("deploy.sh", "755")
console.log("✅ Created deploy.sh script")

// Create Docker configuration
const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev:full"]
`

fs.writeFileSync("Dockerfile", dockerfile)
console.log("✅ Created Dockerfile")

// Create docker-compose for development
const dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/auraluxe
    depends_on:
      - mongo
    volumes:
      - .:/app
      - /app/node_modules

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
`

fs.writeFileSync("docker-compose.yml", dockerCompose)
console.log("✅ Created docker-compose.yml")

// Create MongoDB indexes script
const mongoIndexes = `// MongoDB Indexes for Auraluxe
// Run this script in MongoDB shell or MongoDB Compass

use auraluxe;

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "likedTracks.trackId": 1 });
db.users.createIndex({ "recentlyPlayed.playedAt": -1 });

// Playlists collection indexes
db.playlists.createIndex({ "userId": 1 });
db.playlists.createIndex({ "isPublic": 1 });
db.playlists.createIndex({ "name": "text", "description": "text" });
db.playlists.createIndex({ "tracks.trackId": 1 });
db.playlists.createIndex({ "createdAt": -1 });
db.playlists.createIndex({ "updatedAt": -1 });

console.log("✅ All indexes created successfully!");
`

fs.writeFileSync("scripts/mongodb-indexes.js", mongoIndexes)
console.log("✅ Created MongoDB indexes script")

// Create API documentation
const apiDocs = `# Auraluxe API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
\`\`\`json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
\`\`\`

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
\`\`\`json
{
  "email": "string",
  "password": "string"
}
\`\`\`

### GET /api/auth/me
Get current user information (requires authentication).

## Music Endpoints

### GET /api/music/search
Search for music across multiple APIs.

**Query Parameters:**
- \`q\`: Search query (required)
- \`limit\`: Number of results (default: 20)

### GET /api/music/trending
Get trending tracks.

**Query Parameters:**
- \`limit\`: Number of results (default: 20)

### GET /api/music/track/:id
Get specific track information.

## Playlist Endpoints

### GET /api/playlists
Get user's playlists (requires authentication).

### POST /api/playlists
Create a new playlist (requires authentication).

**Request Body:**
\`\`\`

`
