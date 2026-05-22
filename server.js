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

// ✅ CORS must be FIRST
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://farmora-front-9spo.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Socket setup (only once)
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://farmora-front-9spo.vercel.app'
    ],
    credentials: true
  }
});

initSocket(io);
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Farmora API Running...");
});

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  server.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

startServer();