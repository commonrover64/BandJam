import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const MapExploreScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      setMapRegion({ ...coords, latitudeDelta: 0.1, longitudeDelta: 0.1 });

      // fetch nearby rooms
      const res = await api.get("/rooms/search", {
        params: { lat: coords.latitude, lng: coords.longitude, radius: 10 },
      });
      setRooms(res.data.rooms);
    };
    init();
  }, []);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Explore Map 🗺
      </Text>

      {mapRegion && (
        <MapView style={styles.map} region={mapRegion}>
          {/* user location */}
          {location && (
            <Marker coordinate={location} pinColor={colors.blue}>
              <Callout>
                <Text>You are here</Text>
              </Callout>
            </Marker>
          )}

          {/* room markers */}
          {rooms.map((room) => (
            <Marker
              key={room.id}
              coordinate={{
                latitude: parseFloat(room.lat),
                longitude: parseFloat(room.lng),
              }}
            >
              <Callout
                onPress={() =>
                  navigation.navigate("Home", {
                    screen: "RoomDetail",
                    params: { roomId: room.id },
                  })
                }
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{room.name}</Text>
                  <Text style={styles.calloutPrice}>
                    ₹{room.price_per_day}/day
                  </Text>
                  <Text style={styles.calloutTap}>Tap to view →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  title: {
    fontWeight: "bold",
    color: colors.text,
    marginTop: 48,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  map: { flex: 1 },
  callout: { padding: 8, minWidth: 150 },
  calloutName: { fontWeight: "bold", fontSize: 14, marginBottom: 2 },
  calloutPrice: { color: "green", marginBottom: 4 },
  calloutTap: { color: "#666", fontSize: 12 },
});

export default MapExploreScreen;
