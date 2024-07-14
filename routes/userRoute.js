import express from 'express';
import {
  changePassword,
  getProfile,
  searchUsers,
  updateProfile,
  updateProfileImg,
} from '../Controllers/UserController.js'
import { verifyToken } from '../middleware/verifyUser.js';

const userRouter = express.Router();

userRouter.post('/search-users', searchUsers);
userRouter.post('/get-profile', getProfile);
userRouter.post('/change-password', verifyToken, changePassword);
userRouter.post('/update-profile-img', verifyToken, updateProfileImg);
userRouter.post('/update-profile', verifyToken, updateProfile);


export default userRouter;
