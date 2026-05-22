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
import {initSocket} from "./sockets/socket.js"
import path from "path"

const app = express();
const server = http.createServer(app);

// init socket
initSocket(server);

// server.listen(5000, () => {
//   console.log("Server running on port 5000");
// });

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



// Socket setup
const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true
  }
});

initSocket(io);
app.set("io", io);

// Middleware
app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Farmora API Running...");
});

// Error Middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

startServer();