import React, { useEffect, useRef } from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import OwnerTabs from "./OwnerTabs";
import ConsumerTabs from "./ConsumerTabs";

const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

// `shouldShowAlert` is deprecated in expo-notifications 0.32 (SDK 54)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const routeForNotification = (data, role) => {
  if (!data?.type) return null;
  if (data.type === "booking_request" && role === "owner") {
    // owner should land on the pending requests, not the dashboard
    return ["OwnerTabs", { screen: "Requests" }];
  }
  if (
    (data.type === "booking_approved" || data.type === "booking_declined") &&
    role !== "owner"
  ) {
    return ["ConsumerTabs", { screen: "My Bookings" }];
  }
  return null;
};

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const pendingResponse = useRef(null);
  const roleRef = useRef(user?.role);
  roleRef.current = user?.role;

  const handleResponse = (response) => {
    const data = response?.notification?.request?.content?.data;
    const target = routeForNotification(data, roleRef.current);
    if (!target) return;
    if (navigationRef.isReady() && roleRef.current) {
      navigationRef.navigate(...target);
    } else {
      // app is still loading / user not restored yet — try again when ready
      pendingResponse.current = response;
    }
  };

  const flushPending = () => {
    if (pendingResponse.current && navigationRef.isReady() && roleRef.current) {
      const r = pendingResponse.current;
      pendingResponse.current = null;
      handleResponse(r);
    }
  };

  useEffect(() => {
    // taps while the app is running / in background
    const sub = Notifications.addNotificationResponseReceivedListener(handleResponse);

    // tap that cold-started the app (the listener above misses this one)
    Notifications.getLastNotificationResponseAsync()
      .then((r) => r && handleResponse(r))
      .catch(() => {});

    return () => sub.remove();
  }, []);

  // user restored after a cold start → handle any queued tap
  useEffect(() => {
    flushPending();
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} onReady={flushPending}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : user.role === "owner" ? (
          <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
        ) : (
          <Stack.Screen name="ConsumerTabs" component={ConsumerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
