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

const router = express.Router();

// All routes are public (no auth required)

// Create a new partner request
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

// Delete a partner request
router.delete("/:id", deletePartnerRequest);

export default router;
