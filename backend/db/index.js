import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGODB_URI,);
        console.log(`Database connected successfully`);
    }catch(err){
        console.error("Database connection error:", err);
        process.exit(1);
    }
}