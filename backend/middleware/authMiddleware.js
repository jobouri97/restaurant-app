import { verifyToken } from "../utils/jwt.js";

export const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required",
    });
  }

  const token = authorization.slice(7);

  try {
    const payload = verifyToken(token);

    req.auth = {
      userId: payload.userId,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token is invalid or expired",
    });
  }
};