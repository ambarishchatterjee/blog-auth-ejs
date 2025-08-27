const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

// Admin-only routes
router.get("/", protect, restrictTo("admin"), getAllUsers);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

module.exports = router;
