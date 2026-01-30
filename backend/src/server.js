import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { connectDB } from "../db/connectDB.js";
import authRoutes from "../routes/auth.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 1234;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
};

startServer();
