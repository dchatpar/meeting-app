import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCollection",
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    }, 
      event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
  },
  { timestamps: true }
);


export const Slots = mongoose.model("Slot", slotSchema);
