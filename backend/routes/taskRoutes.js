const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

const { verifyToken } = require("../controllers/authController");

// Protect all routes with authMiddleware
router.use(authMiddleware);

// Verify authentication token
router.get("/auth/verify", verifyToken);

// Task CRUD
router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;