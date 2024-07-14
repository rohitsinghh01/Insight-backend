import mongoose from 'mongoose';
import 'dotenv/config';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      autoIndex: true,
    });
    console.log('Database is connected!!!');
  } catch (error) {
    console.error(`Error: ${error} `);
    process.exit(1);
  }
};

export default connectDB;
