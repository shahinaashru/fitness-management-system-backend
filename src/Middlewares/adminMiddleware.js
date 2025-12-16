const jwt = require("jsonwebtoken");
const userMiddleware = (req, res, next) => {
  try {
    const { admin_token } = req.cookies;
    if (!admin_token) {
      return res.status(401).json({ error: "jwt not found" });
    }
    const verifiedToken = jwt.verify(admin_token, process.env.JWT_SECRET);
    if (!verifiedToken) {
      res.status(401).json({ error: "User not autherized" });
    }
    req.admin = verifiedToken.id;
    next();
  } catch (error) {
    return res
      .status(error.status || 401)
      .json({ error: error.message || "User autherization failed" });
  }
};
module.exports = userMiddleware;
