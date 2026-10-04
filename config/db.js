import mongoose from 'mongoose';
import { seedInitialJobs } from '../models/JobModel.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job-portal');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        await seedInitialJobs();
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};

export default connectDB;
