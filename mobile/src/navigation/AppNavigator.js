import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import OwnerTabs from "./OwnerTabs";
import ConsumerTabs from "./ConsumerTabs";

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  // still checking stored token — show spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // not logged in — show auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
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
