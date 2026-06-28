const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  syncUser,
  getMe,
  updateProfile,
  updateEmail,
  updatePassword
} = require("../controllers/userController");

// Protect all routes with authMiddleware
router.use(authMiddleware);

router.post("/sync", syncUser);
router.get("/me", getMe);
router.put("/profile", updateProfile);
router.put("/email", updateEmail);
router.put("/password", updatePassword);

module.exports = router;
