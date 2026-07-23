const API_URL = import.meta.env.VITE_API_URL;

const sendRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const registerUser = ({ name, email, password }) => {
  return sendRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
};

export const loginUser = ({ email, password }) => {
  return sendRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

export const getCurrentUser = (token) => {
  return sendRequest("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};