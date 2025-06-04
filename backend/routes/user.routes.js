import express from "express";
import {registerUser , loginUser ,logoutUser, checkAuth} from "../controllers/user.controller.js";
import authMiddleware from '../middlewares/authMiddleware.js'

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout',authMiddleware ,logoutUser);
userRouter.get('/check', authMiddleware, checkAuth);

export default userRouter