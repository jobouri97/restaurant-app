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

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getCategories = () => request("/api/categories");

export const createCategory = ({ name, imageUrl }) =>
  request("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name, imageUrl }),
  });

export const updateCategory = (id, { name, imageUrl }) =>
  request(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, imageUrl }),
  });

export const deleteCategory = (id) =>
  request(`/api/categories/${id}`, {
    method: "DELETE",
  });
