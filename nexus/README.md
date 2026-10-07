# 🚀 NEXUS

**Connect. Chat. Share. Discover.**

A full-stack mobile social platform combining messaging, communities, channels, stories,
short-form video, and AI conversation helpers.

---

## What's inside

| Layer | Stack |
|-------|-------|
| Mobile | React Native (Expo SDK 52) · React Navigation 7 · Socket.IO client |
| Backend | Node.js · Express · Socket.IO · MongoDB + Mongoose |
| Auth | **Passwordless Email OTP** — JWT access + rotating refresh tokens |
| Media | Cloudinary |
| AI | **Google Gemini** (server-side only — key never ships to mobile) |

---

## Features

**Messaging**
- 1:1 and group chats with realtime delivery, typing indicators, read receipts
- Message reactions, replies, edit, delete, forward
- Voice messages, images, videos, files, location, contacts
- Disappearing messages, view-once media, chat lock

**Social**
- Posts (text, image, carousel, video) with likes, comments, saves, hashtags
- Follow / unfollow / private accounts / follow requests
- Explore grid, trending hashtags, search across users / posts / communities / channels
- Stories + Status (24h expiry, viewer, reactions, privacy)

**Communities**
- Groups with admin roles and member management
- Communities containing announcement channels + groups
- Broadcast channels with subscriber counts
- Polls in chats, groups, communities, channels, posts

**Vibes**
- Full-screen vertical short videos with like, comment, save, follow, music

**Calls**
- 1:1 voice and video via WebRTC signaling over Socket.IO (media via Expo AV)
- Call history

**Rizz AI** (Powered by Google Gemini)
- Reply generator · Conversation starter · Message rewriter · Compliment
- Conversation rescue · Screenshot analyzer
- 10 style modes × 7 personalities
- Saved responses · History · Settings

**Nexus AI**
- General-purpose assistant: summarize, rewrite, translate, brainstorm, captions

**Admin**
- User management (activate / suspend / ban / delete)
- Reports queue (pending / review / resolved / rejected)
- Platform statistics + 30-day analytics
- Audit logs for sensitive operations

**Security**
- No traditional passwords exist anywhere
- OTP: cryptographic 6-digit, hashed with SHA-256, 5-min expiry, single-use,
  attempt cap, resend cooldown, IP + identifier rate limiting
- JWT access tokens + rotating refresh tokens, session-per-device
- Helmet, CORS, zod validation, file-type + size validation, admin route guards
- Cloudinary / Gemini / SMTP credentials only ever live server-side

---

## Architecture
