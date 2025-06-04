✅ 1. College Email Login with OTP
Goal: Verify users via .edu emails but keep them anonymous after login.

Steps:

Create a basic user schema in MongoDB: email, verified, OTP, createdAt.

Use Nodemailer to send OTP.

Backend:

Endpoint: POST /auth/request-otp

Generates 6-digit OTP, stores it temporarily (in DB or Redis).

Endpoint: POST /auth/verify-otp

Verifies OTP, issues JWT token (stored in localStorage).

Frontend:

Email input → OTP input screen → Success → Redirect to feed.

✅ Libraries: nodemailer, jsonwebtoken, uuid, bcrypt (if storing hashed OTPs)

✅ 2. Anonymous Posting (with Anon IDs)
Goal: Users post with randomly assigned AnonID (e.g., AnonTiger34)

Steps:

Generate an AnonName per session using UUID + random adjective/animal (store in frontend state and backend session).

Allow post creation (title, body, category).

Schema: Post = { title, body, category, anonID, userID (hidden), createdAt }

Categories: Academic, Personal, Fun, Confessions, etc.

✅ Tools: uniqid-anon-names list

✅ 3. Feed and Post Views
Goal: Display posts from newest to oldest + a trending filter

Steps:

Create REST API:

GET /posts?sort=new

GET /posts?sort=trending

Frontend:

Infinite scroll or pagination

Show post title, snippet, upvotes, time ago, comment count

✅ Libraries: react-query or axios, date-fns

✅ 4. Upvotes / Downvotes System
Goal: Basic post ranking via community votes

Steps:

Schema: Add votes: { up: [userID], down: [userID] } to each post

Frontend:

Show current vote status (up/down/neutral)

Toggle state with POST requests

Backend:

Restrict 1 vote per post per user (via internal ID)

✅ 5. Anonymous Comments
Goal: Enable threaded replies under posts

Steps:

Schema:

js
Copy
Edit
Comment: {
  postId,
  body,
  anonID,
  userID,
  createdAt
}
Frontend:

Comment form under each post

Real-time load or on-demand fetch

Add GET /posts/:id/comments and POST /comments

🔐 Phase 2: Basic Moderation (Week 3)
✅ 6. Name Detection System (Anti-Bullying)
Goal: Prevent any post that names a real person

Steps:

Load a dataset of common Indian names (can find CSV online or scrape)

Write a function using:

Regex match

Levenshtein distance or fuzzy search

On POST /posts, check:

if containsName(body) || containsName(title) → reject or auto-redact

✅ Libraries: fuzzball, fast-fuzzy, levenshtein-edit-distance

✅ 7. Report System
Goal: Allow users to report abusive content

Steps:

Add "Report" button on posts/comments

Backend:

POST /report → record userID, reason, postID

If >3 reports → autoHide: true

Admin Dashboard:

Page to view all reported posts

Approve / Reject / Delete

✅ Optional: Use MongoDB’s aggregation to auto-track report counts

🧩 Phase 3: Trust & Safety (Week 4)
✅ 8. Anonymous ID + IP Logging
Goal: Track abusers quietly while preserving anonymity

Steps:

Store anonymized internal ID for every post (UUID or hashed JWT)

Hash IP using SHA256 before storing in DB

On repeated abuse:

Ban that internal ID from posting

✅ 9. Posting Rules + UX Nudges
Goal: Remind users to stay respectful

Steps:

On post page, show:

❗No real names or personal photos. Abusers will be banned.

Soft warnings during typing using regex on text box input

✅ 10. Post Expiry
Goal: Posts can auto-delete after X time (if selected)

Steps:

Add expiresAt to post schema

Create daily cron job or background worker to delete expired posts

🚨 Phase 4: Advanced Moderation (Optional)
✅ 11. AI-Powered Moderation (Perspective API or OpenAI)
Goal: Auto-flag hate/harassment

Steps:

On post creation:

Send body text to:

Google Perspective API or OpenAI Moderation endpoint

If toxicity/attack/identity scores are high → block or flag

✅ You can build fallback for local testing with simple keyword scoring

✅ 12. Media Uploads (Image, Optional)
Goal: Allow safe memes, screenshots, etc.

Steps:

Use Cloudinary or Firebase for storage

Use face detection (AWS Rekognition, Google Vision API) to:

Block images with recognizable faces (non-selfies)

Disable upload from gallery, allow only camera access (on mobile)

📱 Phase 5: UI Polish + Mobile UX
✅ 13. Mobile-first Design
Goal: Smooth campus usage on phones

Steps:

Use Tailwind’s responsive breakpoints

Add floating action button (FAB) for new post

Clean comment layouts, swipeable actions

✅ 14. Reactions, Prompts, and Polls
Goal: Boost engagement

Steps:

Add daily post like:

“Drop a confession without context 👀”

Users can react (🔥, 😂, 💯)

Poll post type: options, total votes, bar graph UI

✅ 15. Gamification
Goal: Create fun + incentives

Steps:

Anonymous leaderboard for:

Most upvoted post

“Weekly Top Anon”

Assign fun anonymous titles (AnonGuru, AnonTroll etc.)

✅ Recommended Project Tools
Frontend: React + Tailwind, Zustand or Redux (for auth/session)

Backend: Express + Mongoose

Security: helmet, cors, rate-limiter, JWT, hashed IP logs

Testing: Postman, Jest for unit testing

Deployment: Vercel (frontend), Render/Railway (backend), MongoDB Atlas