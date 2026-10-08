import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import api, { setOnUnauthorized } from "../services/api";

const AuthContext = createContext(null);

// Read from app.config.js instead of hardcoding it in two places
const PROJECT_ID =
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId;

// Never throws — a push-token failure must not break login/startup.
const registerPushToken = async () => {
  try {
    if (!Device.isDevice) return;

    if (Platform.OS === "android") {
      // channel must exist before requesting permission on Android 13+
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (existing !== "granted") {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== "granted") return;

    if (!PROJECT_ID) {
      console.warn("No EAS projectId found — skipping push registration");
      return;
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
      projectId: PROJECT_ID,
    });
    await api.patch("/auth/push-token", { push_token: pushToken });
  } catch (err) {
    console.warn("Push token registration failed:", err?.message);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync("token");
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  // expired/invalid token anywhere in the app → back to login
  useEffect(() => {
    setOnUnauthorized(() => logout());
    return () => setOnUnauthorized(null);
  }, [logout]);

  // on app start, check if token exists in secure store
  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await SecureStore.getItemAsync("token");
        if (!stored) return;
        const res = await api.get("/auth/me");
        setToken(stored);
        setUser(res.data.user);
        registerPushToken(); // fire-and-forget, never throws
      } catch {
        // token expired, invalid, or server unreachable — start logged out
        await SecureStore.deleteItemAsync("token").catch(() => {});
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = res.data;
    await SecureStore.setItemAsync("token", newToken);
    setToken(newToken);
    setUser(newUser);
    registerPushToken();
    return newUser;
  };

  const register = async (name, email, password, role, phone) => {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
      phone,
    });
    return res.data;
  };

  const refreshUser = async () => {
    const res = await api.get("/auth/me");
    setUser(res.data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        registerPushToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
