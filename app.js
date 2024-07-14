import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import serviceAccount from './FIREBASE_ADMIN_SDK.json' assert { type: 'json' };
import { register } from './Controllers/Register.js';
import { login } from './Controllers/Login.js';
import connectDB from './utils/dbconn.js';
import { googleAuth } from './Controllers/GoogleAuth.js';
import { v2 as cloudinary } from 'cloudinary';
import fileUpload from 'express-fileupload';
import BlogRouter from './routes/blogRoutes.js';
import userRouter from './routes/userRoute.js';
import notificationRouter from './routes/notification.js';
import { ErrorThrow } from './utils/error.js';

const app = express();
let PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(cors());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post('/signup', register);
app.post('/signin', login);
app.post('/google-auth', googleAuth);
app.use(BlogRouter);
app.use(userRouter);
app.use(notificationRouter);
app.use(ErrorThrow);

app.post('/upload-image', async (req, res) => {
  try {
    const { image } = req.files;
    await cloudinary.uploader.upload(image.tempFilePath, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err });
      } else {
        // console.log(result.url)
        return res.status(202).json({ url: result.url });
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/upload-image-url', async (req, res) => {
  const { imageUrl } = req.body;
  console.log(imageUrl);

  try {
    await cloudinary.uploader.upload(imageUrl, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err });
      } else {
        console.log(result.url);
        return res.status(202).json({ url: result.url });
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  await connectDB();
  console.log('Server listening at 3000');
});
