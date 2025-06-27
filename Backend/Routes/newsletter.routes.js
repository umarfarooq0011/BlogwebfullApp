import express from 'express';
import { 
  subscribeToNewsletter,
  getAllSubscribers,
  deleteSubscriber 
} from '../Controllers/newsletter.controller.js';
import { verifyToken } from '../Middlewares/verifyToken.js';
import { isAdmin } from '../Admin/adminMiddleware.js';

const router = express.Router();

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe a user to the newsletter
router.post('/subscribe', subscribeToNewsletter);

// === ADMIN ROUTES ===

// @route   GET /api/newsletter/admin/subscribers
// @desc    Get all subscribers (Admin only)
router.get('/admin/subscribers', verifyToken, isAdmin, getAllSubscribers);

// @route   DELETE /api/newsletter/admin/subscribers/:id
// @desc    Delete a subscriber (Admin only)
router.delete('/admin/subscribers/:id', verifyToken, isAdmin, deleteSubscriber);

export default router; 