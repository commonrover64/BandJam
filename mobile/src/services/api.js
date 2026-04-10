import axios from "axios";
import * as SecureStore from "expo-secure-store";

// change this to your machine's local IP when testing on phone
// localhost won't work on physical device — use your actual IP like 192.168.x.x
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

// attach token to every request automatically
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
