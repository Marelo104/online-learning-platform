import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSendCookie } from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const existingName = await User.findOne({name});
    if(existingName){
        return res.status(400).json({success: false, message: 'name already in use'});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      // only allow student or instructor on signup — admin is set manually
      role: role === "instructor" ? "instructor" : "student",
    });

    await newUser.save();
    generateTokenAndSendCookie(newUser._id, res);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.log("Error in signup:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    generateTokenAndSendCookie(user._id, res);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("learnify_token");
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in getMe:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    let avatarUrl = req.user.avatar;

    if (req.file) {
      const { uploadToCloudinary } = await import("../config/cloudinary.js");
      const { url } = await uploadToCloudinary(
        req.file.path,        // ✅ multer uses req.file.path
        "learnify/avatars",
        "image"
      );
      avatarUrl = url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar: avatarUrl },
      { returnDocument: "after" }
    ).select("-password");

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("Error in updateProfile:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};