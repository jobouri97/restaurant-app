export const TERMINAL_REQUEST_LIFETIME_MS = 2 * 60 * 1000;

const TERMINAL_STATUSES = new Set(["completed", "cancelled"]);

export const getRequestExpiryTime = (request) => {
  if (
    !TERMINAL_STATUSES.has(request.status) ||
    !request.status_changed_at
  ) {
    return null;
  }

  const changedAt = new Date(request.status_changed_at).getTime();
  return Number.isNaN(changedAt)
    ? null
    : changedAt + TERMINAL_REQUEST_LIFETIME_MS;
};

export const isRequestExpired = (request, now = Date.now()) => {
  const expiryTime = getRequestExpiryTime(request);
  return expiryTime !== null && expiryTime <= now;
};
