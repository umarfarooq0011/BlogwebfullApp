import express from "express";
import dotenv from "dotenv";
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

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());  // Allows us to parse incoming requests with JSON payloads
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // Vite dev server default port
  credentials: true // Allow cookies to be sent
}));

app.get('/', (req, res) => {
    res.send("Hello World!");
});

// Routes
app.use("/api", authRoutes);
app.use("/api/blog", blogRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.listen(PORT, async () => {
    await connectDB();
    await seedAdminUser(); // Seed admin user after DB connection
    console.log(`SERVER is running on http://localhost:${PORT}`);
});
