import express from "express";
import {registerUser , loginUser ,logoutUser} from "../controllers/user.controller.js";
import authMiddleware from '../middlewares/authMiddleware.js'

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout',authMiddleware ,logoutUser);

export default userRouter