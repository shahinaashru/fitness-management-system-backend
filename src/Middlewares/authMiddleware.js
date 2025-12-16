const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "jwt not found" });
    }
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifiedToken) {
      res.status(401).json({ error: "User not autherized" });
    }
    req.user = verifiedToken.id;
    next();
  } catch (error) {
    return res
      .status(error.status || 401)
      .json({ error: error.message || "User autherization failed" });
  }
};
module.exports = authMiddleware;
