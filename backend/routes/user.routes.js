import express from 'express';
import { deleteUser, getAllUsers } from '../controller/user.controller.js';

const router = express.Router();

// Get all users (public)
router.get('/', getAllUsers);

// Delete a user (public)
router.delete('/:id', deleteUser);

export default router;
