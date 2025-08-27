const User = require("../models/User");

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.render("users/users", { users, user: req.user });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to fetch users");
    res.redirect("/dashboard");
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success", "User deleted successfully");
    res.redirect("/users");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete user");
    res.redirect("/users");
  }
};
