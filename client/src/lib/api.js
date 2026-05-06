const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getToken = () => localStorage.getItem("crickify_token");

export const saveSession = ({ token, user }) => {
  localStorage.setItem("crickify_token", token);
  localStorage.setItem("crickify_user", JSON.stringify(user));
  window.dispatchEvent(new Event("storage"));
};

export const getUser = () => {
  const user = localStorage.getItem("crickify_user");
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    // Corrupted storage should not crash the app; reset it.
    localStorage.removeItem("crickify_user");
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem("crickify_token");
  localStorage.removeItem("crickify_user");
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const uploadListingMedia = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append("media", file);

  const response = await fetch(`${API_URL}/api/uploads/listing-media`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Upload failed.");
  }

  return data.media;
};
