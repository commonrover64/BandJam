import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, ActivityIndicator, Searchbar } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../../services/api";
import RoomCard from "../../components/RoomCard";
import { colors } from "../../theme/colors";

const SearchScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [showMap, setShowMap] = useState(false); // toggle map visibility

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
      {/* header */}
      <Text variant="headlineMedium" style={styles.title}>
        Find a Space 🎸
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {rooms.length} rooms found nearby
      </Text>

      {/* map toggle button */}
      <TouchableOpacity
        style={styles.mapToggle}
        onPress={() => setShowMap((prev) => !prev)}
      >
        <Text style={styles.mapToggleText}>
          {showMap ? "🗺 Hide Map" : "🗺 Show Map"}
        </Text>
      </TouchableOpacity>

      {/* collapsible map */}
      {showMap && mapRegion && (
        <MapView style={styles.map} region={mapRegion}>
          {location && (
            <Marker coordinate={location} pinColor={colors.blue} title="You" />
          )}
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

      {/* room list */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={colors.lavender} />
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.base },
  title: { fontWeight: "bold", marginTop: 48, color: colors.text },
  subtitle: { color: colors.subtext, marginBottom: 12 },
  mapToggle: {
    backgroundColor: colors.surface0,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  mapToggleText: { color: colors.lavender, fontWeight: "bold" },
  map: { height: 200, borderRadius: 12, marginBottom: 16 },
  empty: { color: colors.overlay, textAlign: "center", marginTop: 48 },
});

export default SearchScreen;
