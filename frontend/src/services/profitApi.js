const API_URL = import.meta.env.VITE_API_URL;

export const getProfits = async () => {
  const response = await fetch(`${API_URL}/api/profits`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const getProfitDetails = async (id) => {
  const response = await fetch(`${API_URL}/api/profits/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};
