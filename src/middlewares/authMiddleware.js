// Protect routes
exports.protect = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error", "Session error, please login again");
    return res.redirect("/login");
  }

  try {
    const user = await require("../models/User").findById(req.session.userId);
    if (!user) throw new Error("User not found in session");

    req.user = user;
    next();
  } catch (err) {
    console.error("Protect Middleware Error:", err);
    req.flash("error", "Session error, please login again");
    res.redirect("/login");
  }
};



// Restrict to roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      req.flash("error", "Not authorized to access this page");
      return res.redirect("/dashboard");
    }
    next();
  };
};
