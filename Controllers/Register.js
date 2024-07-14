import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { formatData } from '../utils/FormatData.js';
import { generateUsername } from '../utils/GenerateUsername.js';

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export const register = async (req, res) => {
  let { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: 'Fullname should be atleast 3 characters long' });
  }
  if (!email.length) {
    return res.status(403).json({ error: 'Email is required' });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: 'Invalid email' });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        'Password should contain atleast 1 uppercase, 1 lowercase, 1 digit and should be 6-20 characters long',
    });
  }

  let hashPassword = await bcrypt.hash(password, 10);
  let username = await generateUsername(email);

  let user = new User({
    personal_info: {
      fullname,
      email,
      password: hashPassword,
      username,
    },
  });
  await user
    .save()
    .then((e) => {
      return res.status(200).json(formatData(user));
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(500).json({ error: 'Email already exists' });
      } else {
        return res.status(500).json({ error: 'An unexpected error occurred' });
      }
    });
};
