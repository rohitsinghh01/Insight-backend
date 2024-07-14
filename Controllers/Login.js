import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { formatData } from '../utils/FormatData.js';

export const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ 'personal_info.email': email })
    .then(async (user) => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      let isPasswordValid = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordValid) {
        return res.status(403).json({ error: 'Invalid password' });
      }
      return res.status(200).json(formatData(user));
    })
    .catch((err) => {
      return res.status(500).json({ error: 'Something went wrong' });
    });
};
