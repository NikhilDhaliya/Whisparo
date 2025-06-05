import User from "../models/user.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid';
import Post from "../models/post.js";

const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET , {expiresIn:"7d", algorithm: "HS256" })
}

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: false, // No HTTPS in development
    sameSite: 'Lax' // Prevents CSRF but works with most dev setups
};

const usernameCookieOptions = {
    httpOnly: true,
    maxAge: 30 * 60 * 1000, // 30 minutes
    secure: false,
    sameSite: 'Lax'
};

const adjectives = [
  'silly', 'wacky', 'zany', 'goofy', 'quirky',
  'dizzy', 'bouncy', 'jumpy', 'wiggly', 'buzzy',
  'fuzzy', 'fluffy', 'sparky', 'snappy', 'zippy'
];

const animals = [
  'cat', 'dog', 'fox', 'owl', 'bat',
  'bee', 'pig', 'cow', 'rat', 'duck',
  'frog', 'bear', 'lion', 'tiger', 'wolf'
];

const generateFriendlyUsername = () => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const id = uuidv4().split('-')[0].slice(0, 4); // Shorter ID
    return `${adjective}_${animal}_${id}`;
};

const setUsernameCookie = (res, username) => {
    const payload = {
        username,
        timestamp: Date.now()
    };
    res.cookie('username', JSON.stringify(payload), usernameCookieOptions);
};

export const registerUser = async (req,res) => {
    const {email , password} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User already exist"});
        }

        const hashedPassword = await bcrypt.hash(password , 10);
        const newUser = await User.create({
            email,
            password:hashedPassword
        });

        const token = generateToken(newUser._id);
        const username = generateFriendlyUsername();
        setUsernameCookie(res, username);

        res.status(201).cookie('auth',token,cookieOptions).json({
            user:{
                _id:newUser._id,
                email:newUser.email,
                username
            },
            token
        });
    }
    catch(error){
        res.status(500).json({message:error.message})
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect credentials" });
        }

        const token = generateToken(existingUser._id);
        existingUser.isLoggedIn = true;
        await existingUser.save();

        const username = generateFriendlyUsername();
        setUsernameCookie(res, username);

        // Update all user's posts with new username
        await Post.updateMany(
            { authorEmail: email },
            { authorUsername: username }
        );

        res.status(200).cookie('auth', token, cookieOptions).json({
            user: {
                _id: existingUser._id,
                email: existingUser.email,
                username
            },
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const user = req.user;
        user.isLoggedIn = false;
        await user.save();

        res.clearCookie("auth", {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });
        res.clearCookie("username", {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.status(200).json({ message: "Logged out successfully", user });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Check if username cookie exists and is valid
        const usernameCookie = req.cookies.username;
        let username;
        
        if (usernameCookie) {
            try {
                const parsed = JSON.parse(usernameCookie);
                const age = Date.now() - parsed.timestamp;
                if (age < 30 * 60 * 1000) {
                    username = parsed.username;
                }
            } catch (e) {
                console.error('Error parsing username cookie:', e);
            }
        }

        // Generate new username if needed
        if (!username) {
            username = generateFriendlyUsername();
            setUsernameCookie(res, username);
        }

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                username
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ message: error.message });
    }
};
