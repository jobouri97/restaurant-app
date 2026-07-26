import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import {
  createGoogleUser,
  createUser,
  findUserByEmail,
  findUserById,
  linkGoogleAccount,
} from "../models/userModel.js";
import { generateToken } from "../utils/jwt.js";
import crypto from "node:crypto";

const googleClient = new OAuth2Client();

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  isAdmin: user.is_admin,
});

export const register = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const name = req.body.name?.trim();
    const password = req.body.password;

    if (!email || !name || !password) {
      return res.status(400).json({
        message: "Email, name, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const publicCode = crypto
      .randomBytes(9)
      .toString("base64url");

    const user = await createUser({
      email,
      name,
      passwordHash,
      publicCode
    });

    const token = generateToken(user.id);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = user.password_hash
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.is_admin,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await findUserById(req.auth.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const credential = req.body.credential;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    if (!clientId) {
      return res.status(503).json({ message: "Google authentication is not configured" });
    }

    let ticket;

    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch {
      return res.status(401).json({ message: "Google credential is invalid or expired" });
    }
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      return res.status(401).json({ message: "Google account could not be verified" });
    }

    const email = payload.email.trim().toLowerCase();
    let user = await findUserByEmail(email);

    if (user?.google_id && user.google_id !== payload.sub) {
      return res.status(409).json({ message: "This email is linked to another Google account" });
    }

    if (user) {
      if (!user.google_id) {
        user = await linkGoogleAccount({ userId: user.id, googleId: payload.sub });
      }
    } else {
      user = await createGoogleUser({
        email,
        name: payload.name?.trim() || email.split("@")[0],
        googleId: payload.sub,
        publicCode: crypto.randomBytes(9).toString("base64url"),
      });
    }

    return res.json({
      message: "Google login successful",
      token: generateToken(user.id),
      user: toPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
};
