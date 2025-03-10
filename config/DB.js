import mongoose from "mongoose";

const connectDB = async() => {
    try{
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${db.connection.readyState}`);
        console.log(`MongoDB connected: ${db.connection.host}`);


    }catch(err)
    {
        console.error(err.message);
        process.exit(1);
    } ;
};

export default connectDB;