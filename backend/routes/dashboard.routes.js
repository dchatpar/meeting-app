import express from 'express';
import { 
  getDashboardData, 
  getUsersListCompanywise, 
  getEventCompanies, 
  getEventSlots,
  getStatusDistribution
} from '../controller/dashboard.controller.js';

const router = express.Router();

// Get dashboard data - public (no auth required)
router.get('/', getDashboardData);
router.post('/users-slot/:eventId', getUsersListCompanywise);
router.get('/companies/:eventId', getEventCompanies);
router.get('/slots/:eventId', getEventSlots);
router.get('/status-distribution/:eventId?', getStatusDistribution);

export default router;