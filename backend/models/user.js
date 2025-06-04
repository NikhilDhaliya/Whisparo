import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
      password: {
        type: String,
        required: true,
      },
    verified:{
        type:Boolean,
    },
    otp:{
        type:Number,
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true,
})

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;