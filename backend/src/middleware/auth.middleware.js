const jwt = require("jsonwebtoken");

// Verify JWT Token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(token, "mysecretkey");

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

// Role Check Middleware
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: Access Denied",
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
};