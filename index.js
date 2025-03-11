import express from 'express';

import dotenv from 'dotenv';

import connectDB from './config/DB.js';

import authRoutes from './routes/authRoute.js'

import errorHandler from './middleware/errorHandler.js';

import bankRoutes from "./routes/bankRoutes.js";

import cookieParser from 'cookie-parser';
import userRoute from "./routes/userRoute.js"

import cors from 'cors';

dotenv.config();

const port=process.env.PORT||3000;

const app = express();

app.use(express.json());

app.use(cookieParser()); 

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use("/api/auth", authRoutes);

app.use("/api/bank", bankRoutes);

app.use("/api/Manage", userRoute);


app.use(errorHandler);


app.listen(port, () => {
  connectDB(); 
console.log(`App listening on port ${port}`);
});