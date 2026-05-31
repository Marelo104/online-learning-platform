import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const protectRoute = async(req, res, next)=>{
    try {
        const authToken = req.cookies.learnify_token
        if (!authToken) {
            return res.status(401).json({success: false, message: "Unauthorized: No token provided" });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({success: false, message: "Unauthorized: Invalid token" });
        }

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({success: false, message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        return res.status(401).json({success: false, message: "Unauthorized: Token verification failed" });
    }
}

// instructor OR admin can access
export const instructorOnly = (req, res, next) => {
  if (req.user.role !== "instructor" && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Instructors only." });
  }
  next();
};

// admin only
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
};