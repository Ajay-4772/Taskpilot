const verifyToken = (req, res) => {
  // If authMiddleware passes, req.user is already populated
  res.status(200).json({
    authenticated: true,
    user: req.user
  });
};

module.exports = {
  verifyToken
};
