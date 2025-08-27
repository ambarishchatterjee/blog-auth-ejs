const Blog = require("../models/Blog");

exports.dashboardPage = async (req, res) => {
  try {
    const userBlogs = await Blog.find({ user: req.user._id, isDeleted: false }).sort({ createdAt: -1 });
    let allBlogs = [];
    if (req.user.isAdmin) {
      allBlogs = await Blog.find({}).sort({ createdAt: -1 });
    }

    res.render("layouts/main", {
      title: "Dashboard",
      user: req.user,
      userBlogs,
      allBlogs,
      success: req.flash("success"),
      error: req.flash("error"),
      body: await res.render("dashboard", { user: req.user, userBlogs, allBlogs, success: req.flash("success"), error: req.flash("error") }, { async: true })
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load dashboard");
    res.redirect("/blogs");
  }
};
