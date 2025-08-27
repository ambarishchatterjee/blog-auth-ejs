const Blog = require("../models/Blog");
const fs = require("fs");
const path = require("path");

// ===============================
// List all blogs
// ===============================
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isDeleted: false })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.render("blogs/index", {
      blogs,
      user: req.user,
      title: "Blogs",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error("Get Blogs Error:", err);
    req.flash("error", "Unable to fetch blogs");
    res.redirect("/login");
  }
};

// ===============================
// Show single blog
// ===============================
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "username");
    if (!blog || blog.isDeleted) {
      req.flash("error", "Blog not found");
      return res.redirect("/blogs");
    }

    res.render("blogs/show", {
      blog,
      user: req.user,
      title: blog.title,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error("Get Blog Error:", err);
    req.flash("error", "Unable to fetch blog");
    res.redirect("/blogs");
  }
};
exports.createBlog = async (req, res) => {
  try {
    // DEBUG: make sure user is available
    if (!req.user) {
      console.error("No user found in session!");
      req.flash("error", "Session error, please login again");
      return res.redirect("/login");
    }
    console.log("Current user:", req.user._id);

    const { title, content } = req.body;

    if (!title || !content) {
      req.flash("error", "Title and content are required");
      return res.redirect("/blogs/blog/create");
    }

    // Handle image upload
    let imagePath;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const blog = new Blog({
      title,
      content,
      image: imagePath,
      author: req.user._id, // Important: match your Blog schema
    });

    await blog.save();

    req.flash("success", "Blog created successfully!");
    res.redirect("/blogs");
  } catch (err) {
    console.error("Create Blog Error:", err);

    // Detailed error logging for validation issues
    if (err.name === "ValidationError") {
      console.error("Validation Errors:", err.errors);
    }

    req.flash("error", "Failed to create blog");
    res.redirect("/blogs/blog/create");
  }
};

// ===============================
// Render edit blog page
// ===============================
exports.editBlogPage = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.flash("error", "Blog not found");
      return res.redirect("/blogs");
    }

    // Make sure field matches schema (`author`)
    if (blog.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      req.flash("error", "Not authorized to edit this blog");
      return res.redirect("/blogs");
    }

    res.render("blogs/edit", {
      blog,
      user: req.user,
      title: "Edit Blog",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error("Edit Blog Page Error:", err);
    req.flash("error", "Unable to load edit page");
    res.redirect("/blogs");
  }
};

// ===============================
// Update blog
// ===============================
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || (blog.author.toString() !== req.user._id.toString() && !req.user.isAdmin)) {
      req.flash("error", "Not authorized to update this blog");
      return res.redirect("/blogs");
    }

    const { title, content } = req.body;

    if (req.file) {
      if (blog.image) {
        const oldPath = path.join(__dirname, "../../public", blog.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      blog.image = `/uploads/${req.file.filename}`;
    }

    blog.title = title;
    blog.content = content;

    await blog.save();

    req.flash("success", "Blog updated successfully!");
    res.redirect(`/`);
  } catch (err) {
    console.error("Update Blog Error:", err);
    req.flash("error", "Failed to update blog");
    res.redirect(`/blogs/edit/${req.params.id}`);
  }
};


// ===============================
// Delete blog
// ===============================
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      req.flash("error", "Blog not found");
      return res.redirect("/blogs");
    }

    if (req.user.isAdmin) {
      // Hard delete
      if (blog.image) {
        const imgPath = path.join(__dirname, "../../public", blog.image);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }
      await blog.deleteOne();
    } else {
      // Soft delete
      if (blog.author.toString() !== req.user._id.toString()) {
        req.flash("error", "Not authorized to delete this blog");
        return res.redirect("/blogs");
      }
      blog.isDeleted = true;
      await blog.save();
    }

    req.flash("success", "Blog deleted successfully!");
    res.redirect("/blogs");
  } catch (err) {
    console.error("Delete Blog Error:", err);
    req.flash("error", "Failed to delete blog");
    res.redirect("/blogs");
  }
};
