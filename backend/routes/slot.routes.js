import express from "express";

import {
  bookSlot,
  deleteSlot,
  getAllBookedSlots,
  getCompanyData,
  getCompanySlotCounts,
  //   markAsCompleted,
  toggleCompletion,
} from "../controller/slot.controller.js";
const router = express.Router();

router.post(`/booking-slot`, bookSlot);
router.delete(`/slot/delete/:id`, deleteSlot);
router.post(`/slot/get-all-booked-slots`, getAllBookedSlots);
router.post(`/slot/get-company-slot-counts`, getCompanySlotCounts);
router.post(`/slot/company/:company`, getCompanyData);
router.post(`/slot/toggle-completed/:id`, toggleCompletion);
export default router;
