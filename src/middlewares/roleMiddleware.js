// Restrict routes to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      req.flash("error", "Not authorized to access this page");
      return res.redirect("/dashboard");
    }
    next();
  };
};
