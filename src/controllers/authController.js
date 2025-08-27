const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ======================
// Register
// ======================
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash("error", "User already exists");
      return res.redirect("/register");
    }

    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const user = await User.create({
      username,
      email,
      password,
      profileImage,
    });

    req.flash("success", "Registration successful! Please login.");
    res.redirect("/login");
  } catch (err) {
    console.error("Registration Error:", err);
    req.flash("error", "Registration failed");
    res.redirect("/register");
  }
};

// ======================
// Login
// ======================
// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    // Set session
    req.session.userId = user._id;

    req.flash("success", "Logged in successfully");
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Login failed");
    res.redirect("/login");
  }
};

// Logout
exports.logout = async (req, res) => {
  // Store message in a temp variable
  const message = "Logged out successfully";

  req.session.destroy(err => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.redirect("/dashboard"); // fallback
    }

    res.clearCookie("connect.sid");
    // Redirect and pass message via query param
    res.redirect("/login?success=" + encodeURIComponent(message));
  });
};

