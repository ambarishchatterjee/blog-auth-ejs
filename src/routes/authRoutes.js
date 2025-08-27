const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const upload = require("../middlewares/multer");

// Auth routes
router.post("/register", upload.single("profileImage"), register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
