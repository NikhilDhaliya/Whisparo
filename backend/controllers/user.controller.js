import User from "../models/user.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid';


const generateToken = (userId) => {
    return jwt.sign({userId}, process.env.JWT_SECRET , {expiresIn:"7d", algorithm: "HS256" })
}

const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: false, // No HTTPS in development
    sameSite: 'Lax' // Prevents CSRF but works with most dev setups
};


  const adjectives = ['cool', 'fast', 'brave', 'smart', 'mysterious'];
  const animals = ['tiger', 'panda', 'falcon', 'otter', 'wolf'];
  
  const generateFriendlyUsername = () => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const id = uuidv4().split('-')[0];
    return `${adjective}_${animal}_${id}`; // e.g., brave_otter_3f1a2c9e
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

        res.status(201).cookie('auth',token,cookieOptions).json({
            user:{
                _id:newUser._id,
                email:newUser.email,
                username: generateFriendlyUsername()
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
        const existingUser = await User.findOne({ email }); // ✅ fix

        if (!existingUser) {
            return res.status(400).json({ message: "User does not exist" }); // 📝 fix message
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect credentials" });
        }

        const token = generateToken(existingUser._id);
        existingUser.isLoggedIn = true;
        await existingUser.save();

        res.status(200).cookie('auth', token, cookieOptions).json({
            user: {
                _id: existingUser._id,
                email: existingUser.email,
                username: generateFriendlyUsername()
            },
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
      const user = req.user; // Get user from auth middleware
  
      user.isLoggedIn = false;
      
      await user.save();
  
      res.clearCookie("auth", {
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
    const user = req.user; // From auth middleware
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        username: generateFriendlyUsername() // Generate a new username for each check
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: error.message });
  }
};
