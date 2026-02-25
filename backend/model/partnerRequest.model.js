import mongoose from "mongoose";

const partnerRequestSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  delegate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserCollection",
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  partners: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCollection",
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
    decisionDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: "",
    },
  }],
  status: {
    type: String,
    enum: ["pending", "approved", "declined", "partially_approved"],
    default: "pending",
  },
  message: {
    type: String,
    default: "",
  },
  dueDate: {
    type: Date,
  },
}, { timestamps: true });

export const PartnerRequest = mongoose.model("PartnerRequest", partnerRequestSchema);
