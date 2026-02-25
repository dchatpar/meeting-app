import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
   assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     slotGap: {
      type: Number,
      required:true
    },
     startDate: {
      type: String,
      required:true
    },
    endDate:{
      type: String,
      required:true
    }
  },
  { timestamps: true }
);

export const Events = mongoose.model("Event", eventSchema);
