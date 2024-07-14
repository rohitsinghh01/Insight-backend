import jwt from 'jsonwebtoken';

export const formatData = (user) => {
  return {
    access_token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    }),
    fullname: user.personal_info.fullname,
    email: user.personal_info.email,
    username: user.personal_info.username,
    profile_img: user.personal_info.profile_img,
  };
};
