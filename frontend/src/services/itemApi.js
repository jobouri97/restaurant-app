const API_URL = import.meta.env.VITE_API_URL;

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 204) return null;

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const getItems = () => request("/api/items");

export const createItem = (item) =>
  request("/api/items", {
    method: "POST",
    body: JSON.stringify(item),
  });

export const updateItem = (id, item) =>
  request(`/api/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(item),
  });

export const deleteItem = (id) =>
  request(`/api/items/${id}`, {
    method: "DELETE",
  });
