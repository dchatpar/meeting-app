import express from "express";
import {
  uploadFile,
  getFileData,
  deleteAllUsers,
  updateUserStatusByEmail,
  updateUser,
  deleteUser
  // getCompanyData,
} from "../controller/file.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

// Upload file route
router.post("/upload-file/:event", upload.single("file"), uploadFile);

// Get file data route (public)
router.get("/get-filedata/:event", getFileData);
router.delete("/delete-filedata/:event", deleteAllUsers);
router.post("/update-status",updateUserStatusByEmail)

// Update a user by ID (public)
router.put("/user/:id", updateUser);
// Delete a user by ID (public)
router.delete("/user/:id", deleteUser);

// router.get(`/company/:companyName`, getCompanyData);`

export default router;
