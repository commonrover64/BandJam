import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, Searchbar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import api from "../../services/api";
import RoomCard from "../../components/RoomCard";
import RoomCarousel from "../../components/RoomCarousel";
import SectionHeader from "../../components/SectionHeader";
import PaginationBar from "../../components/PaginationBar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { colors } from "../../theme/colors";

const PAGE_SIZE = 10;

const SearchScreen = () => {
  const navigation = useNavigation();
  const [rooms, setRooms] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const init = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location needed to find nearby rooms",
        );
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      await Promise.all([
        searchRooms(loc.coords.latitude, loc.coords.longitude),
        fetchRecentRooms(),
      ]);
    };
    init();
  }, []);

  const searchRooms = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await api.get("/rooms/search", {
        params: { lat, lng, radius: 50 },
      });
      setRooms(res.data.rooms);
      setPage(1);
    } catch {
      Alert.alert("Error", "Could not fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentRooms = async () => {
    try {
      const res = await api.get("/bookings/consumer/recent-rooms");
      setRecentRooms(res.data.rooms);
    } catch {
      // silently fail — not critical
    }
  };

  const goToRoom = (room) =>
    navigation.navigate("RoomDetail", { roomId: room.id });

  // filter rooms by search query
  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner message="Finding rooms near you..." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* header row — title + profile icon */}
      <View style={styles.headerRow}>
        <View>
          <Text variant="headlineMedium" style={styles.title}>
            Find a Space 🎸
          </Text>
          <Text style={styles.subtitle}>{filtered.length} rooms near you</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* search bar */}
      <Searchbar
        placeholder="Search rooms by name..."
        value={searchQuery}
        onChangeText={(v) => {
          setSearchQuery(v);
          setPage(1);
        }}
        style={styles.searchbar}
        inputStyle={{ color: colors.text }}
        iconColor={colors.overlay}
        placeholderTextColor={colors.overlay}
        theme={{ colors: { primary: colors.lavender } }}
      />

      {/* recently booked carousel */}
      {recentRooms.length > 0 && (
        <>
          <SectionHeader title="Recently Booked" />
          <RoomCarousel rooms={recentRooms} onPress={goToRoom} />
        </>
      )}

      {/* all rooms grid */}
      <SectionHeader title="Nearby Rooms" />
      <View style={styles.grid}>
        {paginated.map((room) => (
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 48,
    marginBottom: 16,
  },
  title: { fontWeight: "bold", color: colors.text },
  subtitle: { color: colors.subtext, marginTop: 2 },
  profileBtn: {
    backgroundColor: colors.surface0,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  profileEmoji: { fontSize: 18 },
  searchbar: {
    backgroundColor: colors.surface0,
    marginBottom: 20,
    borderRadius: 14,
    elevation: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default SearchScreen;
