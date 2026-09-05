import express from 'express';
import {
  getVapidPublicKey,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribePush,
  unsubscribePush,
} from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All notification endpoints require JWT authentication
router.use(protect);

router.get('/vapid-key', getVapidPublicKey);
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

router.post('/push/subscribe', subscribePush);
router.delete('/push/subscribe', unsubscribePush);

export default router;
