import { PartnerRequest } from "../model/partnerRequest.model.js";
import { Slots } from "../model/Slots.js";
import { UserCollection } from "../model/filedata.model.js";
import { Events } from "../model/event.model.js";

// Create a new partner request (admin sends to delegate)
export const createPartnerRequest = async (req, res) => {
  try {
    const { event, delegate, partners, message, dueDate } = req.body;

    if (!event || !delegate || !partners || partners.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate delegate exists
    const delegateUser = await UserCollection.findById(delegate);
    if (!delegateUser) {
      return res.status(404).json({ error: "Delegate not found" });
    }

    // Validate event exists
    const eventExists = await Events.findById(event);
    if (!eventExists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Validate all partners exist
    for (const partner of partners) {
      const partnerUser = await UserCollection.findById(partner.userId);
      if (!partnerUser) {
        return res.status(404).json({ error: `Partner not found: ${partner.userId}` });
      }
    }

    const partnerRequest = new PartnerRequest({
      event,
      delegate,
      requestedBy: req.user.userId,
      partners,
      message,
      dueDate,
      status: "pending",
    });

    await partnerRequest.save();

    res.status(201).json({
      success: true,
      message: "Partner request created successfully",
      data: partnerRequest,
    });
  } catch (error) {
    console.error("Error creating partner request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all partner requests (filtered by role)
export const getPartnerRequests = async (req, res) => {
  try {
    const { event, status } = req.query;
    const userRole = req.user.role;

    let query = {};

    // If not admin, only show delegate's own requests
    if (userRole !== "admin") {
      // For delegates, we need to find requests where they are the delegate
      // First get the UserCollection ID for this user
      const delegateUser = await UserCollection.findOne({ email: req.user.email });
      if (delegateUser) {
        query.delegate = delegateUser._id;
      }
    }

    if (event) {
      query.event = event;
    }

    if (status) {
      query.status = status;
    }

    const requests = await PartnerRequest.find(query)
      .populate("delegate", "firstName lastName company email")
      .populate("requestedBy", "username")
      .populate("partners.userId", "firstName lastName company email title")
      .populate("event", "title startDate endDate")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching partner requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get pending requests for delegate
export const getDelegatePendingRequests = async (req, res) => {
  try {
    const { event } = req.query;

    // Find the UserCollection for the logged-in user
    const delegateUser = await UserCollection.findOne({ email: req.user.email });
    if (!delegateUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let query = {
      delegate: delegateUser._id,
      status: { $in: ["pending", "partially_approved"] },
    };

    if (event) {
      query.event = event;
    }

    const requests = await PartnerRequest.find(query)
      .populate("delegate", "firstName lastName company email")
      .populate("requestedBy", "username")
      .populate("partners.userId", "firstName lastName company email title")
      .populate("event", "title startDate endDate")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching delegate pending requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Approve a specific partner (delegate action)
export const delegateApprovePartner = async (req, res) => {
  try {
    const { requestId, partnerId, timeSlot } = req.body;

    if (!requestId || !partnerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const partnerRequest = await PartnerRequest.findById(requestId);
    if (!partnerRequest) {
      return res.status(404).json({ error: "Partner request not found" });
    }

    // Verify the delegate is the one responding
    const delegateUser = await UserCollection.findOne({ email: req.user.email });
    if (!delegateUser || partnerRequest.delegate.toString() !== delegateUser._id.toString()) {
      return res.status(403).json({ error: "Not authorized to respond to this request" });
    }

    // Find and update the specific partner
    const partnerIndex = partnerRequest.partners.findIndex(
      (p) => p.userId.toString() === partnerId
    );

    if (partnerIndex === -1) {
      return res.status(404).json({ error: "Partner not found in request" });
    }

    if (partnerRequest.partners[partnerIndex].status !== "pending") {
      return res.status(400).json({ error: "Partner already processed" });
    }

    // Update partner status
    partnerRequest.partners[partnerIndex].status = "approved";
    partnerRequest.partners[partnerIndex].decisionDate = new Date();

    // Check if all partners are processed
    const pendingPartners = partnerRequest.partners.filter((p) => p.status === "pending");
    if (pendingPartners.length === 0) {
      partnerRequest.status = "approved";
    } else {
      partnerRequest.status = "partially_approved";
    }

    await partnerRequest.save();

    // Auto-book slot if timeSlot is provided
    if (timeSlot) {
      // Check if slot already exists
      const existingSlot = await Slots.findOne({
        event: partnerRequest.event,
        userId: partnerId,
        company: partnerRequest.partners[partnerIndex].company,
      });

      if (!existingSlot) {
        const newSlot = new Slots({
          userId: delegateUser._id,
          company: partnerRequest.partners[partnerIndex].company,
          timeSlot,
          event: partnerRequest.event,
        });
        await newSlot.save();

        // Update delegate status
        await UserCollection.findByIdAndUpdate(delegateUser._id, { status: "scheduled" });
      }
    }

    res.status(200).json({
      success: true,
      message: "Partner approved successfully",
      data: partnerRequest,
    });
  } catch (error) {
    console.error("Error approving partner:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Decline a specific partner (delegate action)
export const delegateDeclinePartner = async (req, res) => {
  try {
    const { requestId, partnerId, reason } = req.body;

    if (!requestId || !partnerId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const partnerRequest = await PartnerRequest.findById(requestId);
    if (!partnerRequest) {
      return res.status(404).json({ error: "Partner request not found" });
    }

    // Verify the delegate is the one responding
    const delegateUser = await UserCollection.findOne({ email: req.user.email });
    if (!delegateUser || partnerRequest.delegate.toString() !== delegateUser._id.toString()) {
      return res.status(403).json({ error: "Not authorized to respond to this request" });
    }

    // Find and update the specific partner
    const partnerIndex = partnerRequest.partners.findIndex(
      (p) => p.userId.toString() === partnerId
    );

    if (partnerIndex === -1) {
      return res.status(404).json({ error: "Partner not found in request" });
    }

    if (partnerRequest.partners[partnerIndex].status !== "pending") {
      return res.status(400).json({ error: "Partner already processed" });
    }

    // Update partner status
    partnerRequest.partners[partnerIndex].status = "declined";
    partnerRequest.partners[partnerIndex].decisionDate = new Date();
    partnerRequest.partners[partnerIndex].notes = reason || "";

    // Check if all partners are processed
    const pendingPartners = partnerRequest.partners.filter((p) => p.status === "pending");
    if (pendingPartners.length === 0) {
      // All declined
      const allDeclined = partnerRequest.partners.every((p) => p.status === "declined");
      if (allDeclined) {
        partnerRequest.status = "declined";
      } else {
        partnerRequest.status = "partially_approved";
      }
    }

    await partnerRequest.save();

    res.status(200).json({
      success: true,
      message: "Partner declined",
      data: partnerRequest,
    });
  } catch (error) {
    console.error("Error declining partner:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get single partner request by ID
export const getPartnerRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await PartnerRequest.findById(id)
      .populate("delegate", "firstName lastName company email")
      .populate("requestedBy", "username")
      .populate("partners.userId", "firstName lastName company email title")
      .populate("event", "title startDate endDate");

    if (!request) {
      return res.status(404).json({ error: "Partner request not found" });
    }

    // Check authorization
    const userRole = req.user.role;
    if (userRole !== "admin") {
      const delegateUser = await UserCollection.findOne({ email: req.user.email });
      if (!delegateUser || request.delegate._id.toString() !== delegateUser._id.toString()) {
        return res.status(403).json({ error: "Not authorized to view this request" });
      }
    }

    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching partner request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a partner request (admin only)
export const deletePartnerRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }

    const { id } = req.params;
    const deleted = await PartnerRequest.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Partner request not found" });
    }

    res.status(200).json({ message: "Partner request deleted successfully" });
  } catch (error) {
    console.error("Error deleting partner request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
