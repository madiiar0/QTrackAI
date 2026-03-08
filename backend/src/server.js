import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "../db/connectDB.js";
import authRoutes from "../routes/auth.route.js";
import promptRoutes from "../routes/prompt.route.js";
import filesRoutes from "../routes/files.route.js";
import generateRoutes from "../routes/generate.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 1234;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/prompt", promptRoutes);
app.use("/api/files", filesRoutes)
app.use("/api/generate", generateRoutes)

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
};

startServer();
