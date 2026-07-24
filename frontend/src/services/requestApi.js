const API_URL = import.meta.env.VITE_API_URL;

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const getRequests = () => request("/api/requests");
export const getRequest = (id) => request(`/api/requests/${id}`);
export const setRequestStatus = (id, status) =>
  request(`/api/requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
