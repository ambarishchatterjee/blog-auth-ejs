const express = require("express");
const router = express.Router();
const { dashboardPage } = require("../controllers/dashboardController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/", protect, dashboardPage);

module.exports = router;
