import express from "express";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from "./DB/connectDB.js";
import authRoutes from "./Routes/authRoutes.js";
import blogRouter from "./Routes/BlogRoutes.js";
import adminRoutes from "./Admin/adminRoutes.js";
import { seedAdminUser } from "./Admin/adminUtils.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import newsletterRoutes from "./Routes/newsletter.routes.js";

dotenv.config();

const app = express();

// --- Create a reliable, absolute path to the 'dist' folder ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// --- Serve Static Frontend Files ---
// This tells Express to serve any file from the 'dist' folder if it's requested
app.use(express.static(distPath));

// --- API Routes ---
// These routes handle all your backend logic
app.use("/api", authRoutes);
app.use("/api/blog", blogRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/newsletter", newsletterRoutes);

// --- Frontend Catch-All ---
// This route MUST come AFTER the API routes.
// It sends the index.html file for any request that isn't an API call or a static file.
app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

// --- Database Connection ---
connectDB().then(() => {
    seedAdminUser();
    console.log("Database connected successfully");
    // Start the server
    // app.listen(process.env.PORT || 5000, () => {
    //     console.log(`Server is running on port ${process.env.PORT || 8000}`);
    // });
});
// --- Export the app for Vercel ---
// We DO NOT use app.listen()
export default app;