import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/auth.model.js";

const router = express.Router();

// Create initial admin user (only works if no users exist)
router.post("/init-admin", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if any users exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        message: "Initialization only works when no users exist. Please contact administrator."
      });
    }

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      success: false,
      message: "Error creating admin user"
    });
  }
});

export default router;
