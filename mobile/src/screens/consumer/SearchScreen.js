import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
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
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

const PAGE_SIZE = 10;

const SearchScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (lat, lng) => {
    await Promise.all([searchRooms(lat, lng), fetchRecentRooms()]);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const loc = await Location.getCurrentPositionAsync({});
    await loadData(loc.coords.latitude, loc.coords.longitude);
    setRefreshing(false);
  };

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

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner message="Finding rooms near you..." />;

  return (
    <View style={{ flex: 1 }}>
      {/* Gradient background */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Fixed header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Find a Space</Text>
          <Text style={styles.subtitle}>{filtered.length} rooms near you</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.profileInitial}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fixed search bar */}
      <View style={styles.searchWrapper}>
        <Searchbar
          placeholder="Search rooms by name..."
          value={searchQuery}
          onChangeText={(v) => {
            setSearchQuery(v);
            setPage(1);
          }}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={colors.placeholder}
          placeholderTextColor={colors.placeholder}
          theme={{ colors: { primary: colors.primary } }}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {recentRooms.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Recently Booked" />
            <RoomCarousel rooms={recentRooms} onPress={goToRoom} />
          </View>
        )}

        {/* Nearby rooms */}
        <View style={styles.section}>
          <SectionHeader title="Nearby Rooms" />
          <View style={styles.grid}>
            {paginated.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onPress={() => goToRoom(room)}
              />
            ))}
          </View>
        </View>

        {/* Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 48,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 28,
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.2,
  },

  /* Profile button */
  profileBtn: {
    backgroundColor: "rgba(74, 104, 128, 0.75)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  profileInitial: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  /* Search bar */
  searchWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchbar: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 14,
    elevation: 0,
    height: 48,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  searchInput: {
    color: colors.textDark,
    fontSize: 14,
  },

  /* Sections */
  section: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },

  /* Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 4,
  },
});

export default SearchScreen;
