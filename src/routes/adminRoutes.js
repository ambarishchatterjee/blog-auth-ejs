const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { admin } = require("../middlewares/adminMiddleware");
const User = require("../models/User");
const Blog = require("../models/Blog");

// Admin dashboard
router.get("/dashboard", protect, admin, async (req, res) => {
  try {
    const users = await User.find();
    const blogs = await Blog.find().populate("author", "username").sort({ createdAt: -1 });

    res.render("adminDashboard", {
      user: req.user,
      users,
      blogs,
      title: "Admin Dashboard",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load admin dashboard");
    res.redirect("/");
  }
});

// Admin can delete any blog
router.delete("/blogs/:id", protect, admin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.redirect("/admin/dashboard");
    await blog.deleteOne();
    req.flash("success", "Blog deleted successfully");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete blog");
    res.redirect("/admin/dashboard");
  }
});

// Admin can delete any user
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.redirect("/admin/dashboard");
    await user.deleteOne();
    req.flash("success", "User deleted successfully");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete user");
    res.redirect("/admin/dashboard");
  }
});

module.exports = router;
