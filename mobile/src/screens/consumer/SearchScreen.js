import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../../services/api";
import RoomCard from "../../components/RoomCard";

const SearchScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  // get user's current location on screen load
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location access is needed to find nearby rooms",
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      setMapRegion({ ...coords, latitudeDelta: 0.1, longitudeDelta: 0.1 });
      searchRooms(coords.latitude, coords.longitude);
    };
    getLocation();
  }, []);

  const searchRooms = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await api.get("/rooms/search", {
        params: { lat, lng, radius: 10 },
      });
      setRooms(res.data.rooms);
    } catch (err) {
      Alert.alert("Error", "Could not fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Find a Space 🎸
      </Text>

      {/* map showing nearby rooms */}
      {mapRegion && (
        <MapView style={styles.map} region={mapRegion}>
          {/* user location marker */}
          {location && (
            <Marker
              coordinate={location}
              pinColor="blue"
              title="You are here"
            />
          )}
          {/* room markers */}
          {rooms.map((room) => (
            <Marker
              key={room.id}
              coordinate={{
                latitude: parseFloat(room.lat),
                longitude: parseFloat(room.lng),
              }}
              title={room.name}
              description={`₹${room.price_per_day}/day`}
              onCalloutPress={() =>
                navigation.navigate("RoomDetail", { roomId: room.id })
              }
            />
          ))}
        </MapView>
      )}

      {/* room list below map */}
      <Text variant="titleMedium" style={styles.listTitle}>
        {rooms.length} rooms nearby
      </Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard
              room={item}
              onPress={() =>
                navigation.navigate("RoomDetail", { roomId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No rooms found nearby.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontWeight: "bold", marginBottom: 12, marginTop: 48 },
  map: { height: 220, borderRadius: 12, marginBottom: 16 },
  listTitle: { marginBottom: 8, fontWeight: "bold" },
  empty: { color: "gray", textAlign: "center", marginTop: 32 },
});

export default SearchScreen;
