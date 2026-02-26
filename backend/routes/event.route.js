import express from 'express';
import { createEvent, deleteEvent, getAllEvents, getEventById, getEventReport, getEventTitleList, updateEvent, uploadEventImage } from '../controller/event.controller.js';

const router = express.Router();

// Create a new event
router.post('/',uploadEventImage, createEvent);

// Get all events
router.get('/', getAllEvents);

// Get a single event by ID
router.get('/event-list', getEventTitleList);
router.get('/:id', getEventById);

router.get('/report/:id', getEventReport);

// Delete an event by ID
router.delete('/:id', deleteEvent);

router.put('/:id', updateEvent);

export default router;