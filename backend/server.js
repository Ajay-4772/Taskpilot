const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");

connectDB();

const app = express();
app.use(cors());

const mongoose = require("mongoose");

app.use(express.json());

app.use("/tasks", taskRoutes);
app.use("/users", userRoutes);

app.get(["/health", "/api/health"], (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    status: "ok",
    mongodb: mongoStatus,
    server: "running",
    uptime: process.uptime()
  });
});

app.get("/", (req, res) => {
  res.send("TaskPilot API is running...");
});

// Error handling middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});