import { Server } from "socket.io";
import { verifyToken } from "../utils/jwt.js";

const TRACKING_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;

let io;

const requestRoom = (trackingToken) => `request:${trackingToken}`;
const userRoom = (userId) => `user:${userId}`;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;

    if (typeof token === "string") {
      try {
        const payload = verifyToken(token);
        socket.join(userRoom(payload.userId));
      } catch {
        // Customer tracking sockets do not need an administrator token.
      }
    }

    const tokens = Array.isArray(socket.handshake.auth?.trackingTokens)
      ? socket.handshake.auth.trackingTokens
      : [];

    tokens
      .filter(
        (token) =>
          typeof token === "string" && TRACKING_TOKEN_PATTERN.test(token),
      )
      .forEach((token) => socket.join(requestRoom(token)));
  });

  return io;
};

export const emitRequestCreated = (request) => {
  if (!io || !request?.user_id) return;

  io.to(userRoom(request.user_id)).emit("request:created", {
    id: request.id,
  });
};

export const emitRequestUpdated = (request) => {
  if (!io || !request?.tracking_token) return;

  io.to(requestRoom(request.tracking_token)).emit("request:updated", request);
};
