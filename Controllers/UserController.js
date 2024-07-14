import User from '../models/User.js';
import bcrypt from 'bcrypt';


export const searchUsers = (req, res) => {
  try {
    let { query } = req.body;
    User.find({ 'personal_info.username': new RegExp(query, 'i') })
      .limit(50)
      .select(
        'personal_info.fullname personal_info.username personal_info.profile_img -_id'
      )
      .then((users) => {
        return res.status(200).json({ users });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProfile = (req, res) => {
  try {
    let { username } = req.body;
    User.findOne({ 'personal_info.username': username })
      .select('-personal_info.password -google_auth -updatedAt -blogs')
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: err.message });
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const changePassword = (req, res) => {
  let { currentPassword, newPassword } = req.body;

  if (
    !passwordRegex.test(currentPassword) ||
    !passwordRegex.test(newPassword)
  ) {
    return res
      .status(403)
      .json({
        error:
          'password should be 6 to 20 characters long with a numeric, 1 uppercase and 1 lowercase lettes',
      });
  }

  User.findOne({ _id: req.user })
    .then((user) => {
      if (user.google_auth) {
        return res
          .status(403)
          .json({
            error:
              "You cannot change account's password because you logged in through google",
          });
      }

      bcrypt.compare(
        currentPassword,
        user.personal_info.password,
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({
                error:
                  'Some error occured while changing the password, please try again later',
              });
          }

          if (!result) {
            return res
              .status(403)
              .json({ error: 'Incorrect current Password' });
          }

          bcrypt.hash(newPassword, 10, (err, hashed_password) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            User.findOneAndUpdate(
              { _id: req.user },
              { 'personal_info.password': hashed_password }
            )
              .then((u) => {
                return res.status(200).json({ status: 'password changed' });
              })
              .catch((err) => {
                return res
                  .status(500)
                  .json({
                    error:
                      'Some error occured while saving the new password, please try again later',
                  });
              });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'User not found' });
    });
};

export const updateProfileImg = (req, res) => {
  let { url } = req.body;

  User.findOneAndUpdate({ _id: req.user }, { 'personal_info.profile_img': url })
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

export const updateProfile = (req, res) => {
  let { username, bio, social_links } = req.body;

  let bioLimit = 150;
  if (username.length < 3)
    return res
      .status(403)
      .json({ error: 'Username should be at least 3 letter long' });

  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters` });
  }

  let socialLinksArr = Object.keys(social_links);
  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] != 'website'
        ) {
          return res
            .status(403)
            .json({
              error: `${socialLinksArr[i]} link is invalid. You must enter a valid link.`,
            });
        }
      }
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        error: 'You must provide full social links with http(s) include',
      });
  }

  let updateObj = {
    'personal_info.username': username,
    'personal_info.bio': bio,
    social_links,
  };

  User.findOneAndUpdate({ _id: req.user }, updateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      return res.status(500).json({ error: err.message });
    });
};
