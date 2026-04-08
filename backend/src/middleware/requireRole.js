// returns a middleware that checks if the logged-in user has the required role
const requireRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
};

module.exports = requireRole;
