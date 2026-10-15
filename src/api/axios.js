import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_MY_API,
  headers: { "Content-Type": "application/json" },
}); 

// Attach the JWT token to every outgoing request, if present.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized handling for common HTTP error statuses.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Network error - please check your connection and try again.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = data?.message || "Something went wrong";

    switch (status) {
      case 401:
        // Token missing/expired/invalid - force re-login, but don't loop on the login page itself
        if (!window.location.pathname.startsWith("/login")) {
          localStorage.removeItem("token");
          toast.error(message || "Session expired, please log in again");
          window.location.href = "/login";
        }
        break;
      case 403:
        toast.error(message || "You do not have permission to do that");
        break;
      case 404:
        // Let callers decide whether to surface 404s (e.g. "not found" pages)
        break;
      case 500:
        toast.error(message || "Server error - please try again later");
        break;
      default:
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;
