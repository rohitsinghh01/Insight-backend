import User from '../models/User.js';
export const generateUsername = async (email) => {
  let username = email.split('@')[0];
  let userExits = await User.exists({
    'personal_info.username': username,
  }).then((result) => result);
  userExits ? (username += Math.floor(Math.random() * 1000)) : '';
  return username;
};
