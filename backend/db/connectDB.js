import mongoose from 'mongoose'

export const connectDB = async () => {
    try{
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error){
        console.log("Failed to connect to MongoDB", error.message);
        process.exit(1);
    }
}
