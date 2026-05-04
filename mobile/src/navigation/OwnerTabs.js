import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DashboardScreen from "../screens/owner/DashboardScreen";
import MyRoomsScreen from "../screens/owner/MyRoomsScreen";
import RoomFormScreen from "../screens/owner/RoomFormScreen";
import OnboardingScreen from "../screens/owner/OnboardingScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";
import BookingRequestsScreen from "../screens/owner/BookingRequestScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const OwnerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "rgba(184, 201, 217, 0.97)",
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: "rgba(46,63,82,0.4)",
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardStack}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons
            name="view-dashboard"
            size={24}
            color={color}
          />
        ),
      }}
    />

    <Tab.Screen
      name="My Rooms"
      component={MyRoomsScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="door" size={24} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="Add Room"
      component={RoomFormScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="plus-circle" size={24} color={color} />
        ),
      }}
    />

    <Tab.Screen
      name="Onboarding"
      component={OnboardingScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons
            name="account-check"
            size={24}
            color={color}
          />
        ),
      }}
    />

    <Tab.Screen
      name="Requests"
      component={BookingRequestsScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="bell" size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default OwnerTabs;
