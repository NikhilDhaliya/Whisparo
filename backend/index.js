import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors';
import connectDB from '../backend/config/db.js';
import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';
import commentRouter from './routes/comment.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Support both Vite and React default ports
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Parse cookies before routes
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', userRouter);
app.use('/api/posts', postRouter);
app.use('/api', commentRouter); // Comment routes are prefixed with /api

app.listen(5000, () => {
    connectDB();
    console.log("Server is running on port 5000");
});