import { getAuth } from 'firebase-admin/auth';
import User from '../models/User.js';
import { formatData } from '../utils/FormatData.js';
import { generateUsername } from '../utils/GenerateUsername.js';

export const googleAuth = async (req, res) => {
  try {
    let { access_token } = req.body;

    let decodeUser = await getAuth().verifyIdToken(access_token);
    let { email, name, picture } = decodeUser;
    picture = picture.replace('s96-c', 's384-c');

    let user = await User.findOne({ 'personal_info.email': email })
      .select(
        'personal_info.fullname personal_info.username personal_info.profile_img google_auth'
      )
      .then((u) => {
        return u || null;
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
    if (user) {
      if (!user.google_auth) {
        return res.status(403).json({
          error:
            'This email was signed up without Google. Please log in with password to access the account',
        });
      }
    } else {
      let username = await generateUsername(email);
      user = new User({
        personal_info: {
          fullname: name,
          email,
          profile_img: picture,
          username: username,
        },
        google_auth: true,
      });
      user = await user.save();
    }

    return res.status(200).json(formatData(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error:
        'Failed to authenticate you with Google. Try with some other Google account',
    });
  }
};
