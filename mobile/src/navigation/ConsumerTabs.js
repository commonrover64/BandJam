import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import SearchScreen from "../screens/consumer/SearchScreen";
import MyBookingsScreen from "../screens/consumer/MyBookingsScreen";
import RoomDetailScreen from "../screens/consumer/RoomDetailScreen";
import BookingScreen from "../screens/consumer/BookingScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// stack for search flow: Search → RoomDetail → Booking
const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
  </Stack.Navigator>
);

const ConsumerTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="calendar-check"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ConsumerTabs;
