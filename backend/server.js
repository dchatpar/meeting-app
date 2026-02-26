import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path"
// All connections here
import connectDb from "./lib/db.js";

// All routes here
import fileRoutes from "./routes/file.routes.js";
import eventRoutes from "./routes/event.route.js";
import authRoutes from "./routes/auth.routes.js";
import slotRoutes from "./routes/slot.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import userRoutes from "./routes/user.routes.js";
import partnerRequestRoutes from "./routes/partnerRequest.routes.js";
import initRoutes from "./routes/init.routes.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8493;
// CORS Configuration (Apply this before routes)
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://meeting-app-beta-seven.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://94.250.203.249:5174",
      "https://idc.loopnow.in"
    ];
    
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
};

// Apply CORS middleware with the above options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// All routes here
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/events",eventRoutes);
app.use("/api", slotRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/partner-request", partnerRequestRoutes);
app.use("/api/auth", initRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// app.use("/api/admin", adminRoutes);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDb();
});
