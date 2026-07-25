import { Server } from "socket.io";

const TRACKING_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,64}$/;

let io;

const requestRoom = (trackingToken) => `request:${trackingToken}`;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  io.on("connection", (socket) => {
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

export const emitRequestUpdated = (request) => {
  if (!io || !request?.tracking_token) return;

  io.to(requestRoom(request.tracking_token)).emit("request:updated", request);
};
