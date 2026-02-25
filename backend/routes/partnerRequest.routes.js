import express from "express";
import {
  createPartnerRequest,
  getPartnerRequests,
  getDelegatePendingRequests,
  delegateApprovePartner,
  delegateDeclinePartner,
  getPartnerRequestById,
  deletePartnerRequest,
} from "../controller/partnerRequest.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Create a new partner request (admin only)
router.post("/create", createPartnerRequest);

// Get all partner requests (filtered by role)
router.get("/", getPartnerRequests);

// Get pending requests for delegate
router.get("/delegate/pending", getDelegatePendingRequests);

// Get single partner request
router.get("/:id", getPartnerRequestById);

// Approve a partner (delegate)
router.put("/approve-partner", delegateApprovePartner);

// Decline a partner (delegate)
router.put("/decline-partner", delegateDeclinePartner);

// Delete a partner request (admin only)
router.delete("/:id", deletePartnerRequest);

export default router;
