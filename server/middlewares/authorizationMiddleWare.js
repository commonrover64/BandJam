const jwt = require("jsonwebtoken");

const validateJWTToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decode = jwt.verify(token, process.env.SECRET_KEY);

    if (decode) {
      req.body = {
        email: decode?.email,
        userId: decode?.userId,
      };
      next();
    } else {
      throw new Error("login again");
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or Expired token" });
    next(error);
  }
};

module.exports = { validateJWTToken };
