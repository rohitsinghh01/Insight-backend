import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import {
  allNotificationCount,
  newNotification,
  notifications,
} from '../Controllers/NotificationController.js'

const notificationRouter = express.Router();

notificationRouter.get('/new-notification', verifyToken, newNotification);
notificationRouter.post('/notifications', verifyToken, notifications);

notificationRouter.post(
  '/all-notifications-count',
  verifyToken,
  allNotificationCount
);

export default notificationRouter;
