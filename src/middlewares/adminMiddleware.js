exports.admin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    req.flash("error", "Admin access only");
    return res.redirect("/login");
  }
  next();
};
