const API_URL = import.meta.env.VITE_API_URL;

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const getTableMenu = (qrCode) =>
  request(`/api/public/tables/${encodeURIComponent(qrCode)}`);

export const submitRequest = (qrCode, items) =>
  request(`/api/public/tables/${encodeURIComponent(qrCode)}/requests`, {
    method: "POST",
    body: JSON.stringify({ items }),
  });

export const getTrackedRequest = (trackingToken) =>
  request(`/api/public/requests/${encodeURIComponent(trackingToken)}`);
