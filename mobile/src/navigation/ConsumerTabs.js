import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SearchScreen from "../screens/consumer/SearchScreen";
import MyBookingsScreen from "../screens/consumer/MyBookingsScreen";
import RoomDetailScreen from "../screens/consumer/RoomDetailScreen";
import BookingScreen from "../screens/consumer/BookingScreen";
import MapExploreScreen from "../screens/consumer/MapExploreScreen";
import ProfileScreen from "../screens/shared/ProfileScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const ConsumerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "rgba(184, 201, 217, 0.97)", // gradientStart, near-opaque
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.5)",
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarActiveTintColor: colors.primary, // steel blue
      tabBarInactiveTintColor: "rgba(46,63,82,0.4)",
    }}
  >
    <Tab.Screen
      name="Home"
      component={SearchStack}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="home" size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Map"
      component={MapExploreScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons name="map" size={24} color={color} />
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

export default ConsumerTabs;
