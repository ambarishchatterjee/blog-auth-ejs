const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const connectMongo = require("connect-mongo");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const blogRoutes = require("./src/routes/blogRoutes");
const { protect } = require("./src/middlewares/authMiddleware");
const Blog = require("./src/models/Blog");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5010;

// --------------------
// Basic Middlewares
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// --------------------
// Session (must be before flash)
// --------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // important for flash
    store: connectMongo.create({
      collectionName: "sessions",
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
  })
);

// --------------------
// Flash middleware
// --------------------
app.use(flash());

// --------------------
// Populate req.user from session
// --------------------
app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const User = require("./src/models/User");
      const user = await User.findById(req.session.userId);
      if (user) req.user = user;
    } catch (err) {
      console.error("Session user fetch error:", err);
    }
  }
  next();
});

// --------------------
// Global template variables
// --------------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// --------------------
// Routes
// --------------------

// Home route
app.get("/", async (req, res) => {
  if (req.session.userId) {
    // Optionally fetch user for safety
    try {
      const User = require("./src/models/User");
      const user = await User.findById(req.session.userId);
      if (user) {
        return res.redirect("/dashboard");
      }
    } catch (err) {
      console.error("Error fetching user for home redirect:", err);
    }
  }
  // Not logged in
  res.redirect("/login");
});



app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/admin", adminRoutes);

// EJS Pages
app.get("/login", (req, res) => {
  const successMsg = req.query.success || null;
  res.render("auth/login", { title: "Login page", success: successMsg });
});
app.get("/register", (req, res) => res.render("auth/register", { title: "Registration page" }));

app.get("/dashboard", protect, async (req, res) => {
  try {
    const userBlogs = await Blog.find({ author: req.user._id, isDeleted: false }).sort({ createdAt: -1 });

    let allBlogs = [];
    if (req.user.isAdmin) {
      allBlogs = await Blog.find().sort({ createdAt: -1 });
    }

    res.render("dashboard", {
      user: req.user,
      userBlogs,
      allBlogs,
      title: "Dashboard",
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    req.flash("error", "Failed to load dashboard");
    res.redirect("/blogs");
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ message: "Blog API is running 🚀" });
});

// --------------------
// Error handling
// --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// --------------------
// Connect DB + start server
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
