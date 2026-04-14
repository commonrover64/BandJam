import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../../services/api";
import RoomCard from "../../components/RoomCard";
import RoomCarousel from "../../components/RoomCarousel";
import SectionHeader from "../../components/SectionHeader";
import PaginationBar from "../../components/PaginationBar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { colors } from "../../theme/colors";

const PAGE_SIZE = 10;

const SearchScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);

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
      setPage(1);
    } catch {
      Alert.alert("Error", "Could not fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const goToRoom = (room) =>
    navigation.navigate("RoomDetail", { roomId: room.id });

  // pagination slice
  const totalPages = Math.ceil(rooms.length / PAGE_SIZE);
  const paginated = rooms.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // carousel shows first 5 rooms
  const carouselRooms = rooms.slice(0, 5);

  // grid shows paginated rooms (skip first 5 already shown in carousel)
  const gridRooms = paginated;

  if (loading) return <LoadingSpinner message="Finding rooms near you..." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <Text variant="headlineMedium" style={styles.title}>
        Find a Space 🎸
      </Text>
      <Text style={styles.subtitle}>{rooms.length} rooms near you</Text>

      {/* map toggle */}
      <TouchableOpacity
        style={styles.mapToggle}
        onPress={() => setShowMap((p) => !p)}
        activeOpacity={0.8}
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
              onCalloutPress={() => goToRoom(room)}
            />
          ))}
        </MapView>
      )}

      {/* carousel — featured nearby */}
      {carouselRooms.length > 0 && (
        <>
          <SectionHeader title="Featured Nearby" />
          <RoomCarousel rooms={carouselRooms} onPress={goToRoom} />
        </>
      )}

      {/* grid listing */}
      <SectionHeader title="All Rooms" />
      <View style={styles.grid}>
        {gridRooms.map((room) => (
          <RoomCard key={room.id} room={room} onPress={() => goToRoom(room)} />
        ))}
      </View>

      {/* pagination */}
      <PaginationBar
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontWeight: "bold", marginTop: 48, color: colors.text },
  subtitle: { color: colors.subtext, marginBottom: 16 },
  mapToggle: {
    backgroundColor: colors.surface0,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  mapToggleText: { color: colors.lavender, fontWeight: "bold" },
  map: { height: 200, borderRadius: 16, marginBottom: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default SearchScreen;
