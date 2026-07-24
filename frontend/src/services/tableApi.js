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

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getTables = () => request("/api/tables");

export const createTable = (number) =>
  request("/api/tables", {
    method: "POST",
    body: JSON.stringify({ number }),
  });

export const deleteTable = (id) =>
  request(`/api/tables/${id}`, {
    method: "DELETE",
  });
