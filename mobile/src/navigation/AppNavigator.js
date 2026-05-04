import React from "react";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import OwnerTabs from "./OwnerTabs";
import ConsumerTabs from "./ConsumerTabs";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

const Stack = createStackNavigator();
const navigationRef = createNavigationContainerRef();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const responseListener = useRef();

  useEffect(() => {
    // handle notification tap
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        if (!navigationRef.isReady() || !data?.type) return;

        if (data.type === "booking_request") {
          // owner tapped notification — go to booking requests
          navigationRef.navigate("OwnerTabs", {
            screen: "Dashboard",
          });
        } else if (
          data.type === "booking_approved" ||
          data.type === "booking_declined"
        ) {
          // consumer tapped notification — go to my bookings
          navigationRef.navigate("ConsumerTabs", {
            screen: "My Bookings",
          });
        }
      });

    return () => {
      responseListener.current?.remove();
    };
  }, []);

  // still checking stored token — show spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // not logged in — show auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        ) : user.role === "owner" ? (
          // logged in as owner
          <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
        ) : (
          // logged in as consumer
          <Stack.Screen name="ConsumerTabs" component={ConsumerTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
