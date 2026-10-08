import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Set EXPO_PUBLIC_API_URL in .env (use your LAN IP, not localhost, on a device)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set — all API calls will fail");
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // without this a dead server leaves spinners hanging forever
});

// attach token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AuthContext registers a handler so an expired token logs the user out
// cleanly instead of every screen erroring independently.
let onUnauthorized = null;
export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");
    if (status === 401 && !isAuthCall && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default api;
