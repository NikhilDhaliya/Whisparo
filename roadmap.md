# 🛣️ AnonBoard - Roadmap

**Project:** AnonBoard  
**Tagline:** Real Conversations. No Filters. Just Students.  
**Goal:** Build a safe, anonymous discussion platform for college students — enabling open dialogue without fear of judgment or exposure.

---

## 📌 Core Values

- ✅ Anonymity with Accountability
- 🚫 No name/photo-based bullying or harassment
- 🧠 Honest, helpful, unfiltered student conversations
- 📱 Optimized for frequent, mobile-first campus use

---

## 🔰 Phase 1: MVP - Core Platform (Week 1–2)

### ✅ Features
- [ ] College email login with OTP (no usernames)
- [ ] Anonymous ID per session/post (e.g., "AnonLion54")
- [ ] Post creation (text-only): title, body, category
- [ ] Real-time Feed: latest + trending view
- [ ] Upvote/downvote posts
- [ ] Threaded anonymous replies (comments)
- [ ] Filter by category (e.g., Academic, Personal, Fun)
- [ ] Post auto-expiry (optional toggle: 24hr, 7d)

### 🧰 Tech Stack
- **Frontend:** React + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (with Mongoose)
- **Auth:** OTP via Nodemailer + JWT
- **Session:** Internal UUIDs per user

---

## 🔐 Phase 2: Basic Moderation + Anti-Abuse (Week 3)

### ✅ Features
- [ ] Name detection system (basic NLP + name list)
- [ ] Block posts with known names (or redact)
- [ ] Disallow photo uploads (initially)
- [ ] Auto-hide posts with >3 reports
- [ ] Report system for posts and comments
- [ ] Basic admin dashboard to review reported content

### 🧠 Name Filter
- Load Indian/common names list
- Use fuzzy string matching (Levenshtein distance or Regex)
- Auto-warn or block user from posting if name detected

---

## 🧩 Phase 3: Trust & Safety (Week 4)

### ✅ Features
- [ ] Anonymous ID tracking via hashed internal UUID
- [ ] IP logging (hashed) for repeat abuse prevention
- [ ] Soft-ban system (user loses posting privileges)
- [ ] Post/edit/delete for 15 mins after posting
- [ ] Posting rule reminder at top of post creation page

### 🔒 Internal Logging
- Save:
  - user ID (anon)
  - IP hash
  - timestamps
  - category
  - report status

---

## 🚨 Phase 4: Advanced Moderation (Optional/Post-MVP)

### ✅ Features
- [ ] Integrate OpenAI Moderation API or Perspective API
- [ ] Auto-flag hate speech, NSFW, harassment
- [ ] Human review queue
- [ ] Post status: “Under Review”, “Approved”, “Hidden”
- [ ] Image uploads with moderation (Cloudinary + Rekognition)

---

## 📱 Phase 5: UI/UX Polish + Mobile Experience

### ✅ Features
- [ ] Mobile-first responsive layout
- [ ] Infinite scroll feed
- [ ] Quick reply UI (no modal)
- [ ] Toasts for post success/failure
- [ ] Trending bar or highlight section
- [ ] Dark mode toggle

---

## 🌱 Phase 6: Community Growth Features

### ✅ Features
- [ ] Daily Confession Prompt
- [ ] Polls (anonymous voting)
- [ ] Reactions (🔥, 😢, 💯) on posts
- [ ] Anonymous leaderboard (Top Posts of the Week)
- [ ] Invite system (referrals)
- [ ] QR poster generator for campus walls

---

## 🧮 Database Schema (Simplified)

### `users`
- `_id`, `email`, `verified`, `banned`, `createdAt`

### `posts`
- `_id`, `anonID`, `title`, `body`, `category`, `votes`, `comments`, `createdAt`, `expiresAt`, `reports`

### `comments`
- `_id`, `postId`, `anonID`, `body`, `createdAt`, `reports`

### `reports`
- `postId` or `commentId`, `reason`, `reportedBy`, `timestamp`

---

## 🧠 Future Ideas

- 🤖 AI-powered post tone detection (to warn toxic users)
- 🌐 Expand to other colleges via campus codes
- 🧑‍⚖️ Appoint student moderators with limited admin rights
- 🕹️ Gamification (badges, karma score – internally only)

---

## ✅ Milestones Summary

| Week | Goals |
|------|-------|
| 1    | Auth, Create Post, Feed, Upvotes |
| 2    | Comments, Filters, Post Expiry |
| 3    | Reporting, Name Filtering, Admin Dashboard |
| 4    | Safety Systems, Internal Logging |
| 5+   | UI Polish, Mobile, Polls & Prompts, Growth Features |

---

## 📄 LICENSE

To be determined. Recommend MIT or AGPL if public.

---

## 👨‍💻 Built by Students, for Students.

Want to contribute?  
Start a fork, report issues, or submit ideas via GitHub Discussions.

