import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  usersList,
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);
router.post("/users-list",usersList );

router.get("/check-auth", checkAuth);
// router.post("/verify-email",verifyemail);

// router.post("/forgot-password",forgotPassword);

// router.post("/reset-password/:token", resetPassword);

export default router;
