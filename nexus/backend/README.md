# NEXUS Backend

Node.js + Express + MongoDB backend for the NEXUS mobile app.

## Features
- Passwordless Email OTP authentication (no user passwords anywhere)
- JWT access + refresh tokens with rotation
- Session management per device
- Socket.IO realtime messaging, presence, typing, calls
- Cloudinary media uploads
- Google Gemini powered Rizz AI + Nexus AI
- Admin dashboard APIs, moderation queues, audit logs
- Rate limiting, validation (zod), Helmet, CORS

## Requirements
- Node 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail (or other SMTP) account with App Password
- Google Gemini API key

## Install
```bash
npm install