import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DashboardScreen from "../screens/owner/DashboardScreen";
import MyRoomsScreen from "../screens/owner/MyRoomsScreen";
import CreateRoomScreen from "../screens/owner/CreateRoomScreen";
import OnboardingScreen from "../screens/owner/OnboardingScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";

const Tab = createBottomTabNavigator();

const OwnerTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
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
      component={CreateRoomScreen}
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
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="account" size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default OwnerTabs;
