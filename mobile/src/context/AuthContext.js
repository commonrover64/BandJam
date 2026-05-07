import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import api from "../services/api";
import { Platform } from "react-native";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const registerPushToken = async () => {
    const projectId = "81885d94-5958-492b-840c-162627a70e8b";

    if (!Device.isDevice) {
      console.log("Skipping push token — not a real device");
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permission denied");
      return;
    }

    // Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    try {
      const pushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;

      await api.patch("/auth/push-token", { push_token: pushToken });
    } catch (err) {
      throw err;
    }
  };

  // on app start, check if token exists in secure store
  useEffect(() => {
    const loadToken = async () => {
      const stored = await SecureStore.getItemAsync("token");
      if (stored) {
        setToken(stored);
        // fetch user details using stored token
        try {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
          await registerPushToken();
        } catch {
          // token expired or invalid, clear it
          await SecureStore.deleteItemAsync("token");
        }
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user } = res.data;
    await SecureStore.setItemAsync("token", token);
    setToken(token);
    setUser(user);
    try {
      await registerPushToken(); // register after login
    } catch (error) {
      console.error("push token failed: ", error.message);
    }
    return user; // return user so navigator knows which role to redirect to
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

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    setUser(null);
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

// custom hook for easy access anywhere
export const useAuth = () => useContext(AuthContext);
