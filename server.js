import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { initSocket } from "./sockets/socket.js";
import path from "path";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ENV.CLIENT_URL, // reads from .env — no trailing slash!
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ✅ CORS middleware first
app.use(cors(corsOptions));

// ✅ Explicitly handle OPTIONS preflight for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});

initSocket(io);
app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("Farmora API Running..."));
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  server.listen(ENV.PORT, () => console.log(`Server running on port ${ENV.PORT}`));
};

startServer();