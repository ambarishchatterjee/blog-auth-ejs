const express = require("express");
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  editBlogPage,
} = require("../controllers/blogController");

const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// Protected routes
router.get("/blog/create", protect, (req, res) => {
  res.render("blogs/create", {
    user: req.user,
    title: "Create Blog",
    success: req.flash("success"),
    error: req.flash("error"),
  });
});
router.post("/create", protect, upload.single("image"), createBlog);
router.put("/:id", protect, upload.single("image"), updateBlog);
router.delete("/:id", protect, deleteBlog);
router.get("/edit/:id", protect, editBlogPage);

// Public routes
router.get("/", getAllBlogs);
router.get("/:id", getAllBlogs, getBlogById); // <-- single blog should come after /edit/:id

module.exports = router;
