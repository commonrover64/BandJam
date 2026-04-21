import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from "react-native";
import { Text, ActivityIndicator, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import BookingCard from "../../components/BookingCard";
import PaginationBar from "../../components/PaginationBar";
import LoadingSpinner from "../../components/LoadingSpinner";
import { colors } from "../../theme/colors";
import { useNavigation } from "@react-navigation/native";

const PAGE_SIZE = 10;
const FILTERS = ["All", "This Month", "Last Month", "Confirmed", "Cancelled"];

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/consumer/me");
      setBookings(res.data.bookings);
    } catch {
      Alert.alert("Error", "Could not fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleCancel = async (id) => {
    Alert.alert("Cancel Booking", "Are you sure?", [
      { text: "No" },
      {
        text: "Yes Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await api.patch(`/bookings/${id}/cancel`);
            setBookings((prev) =>
              prev.map((b) =>
                b.id === id ? { ...b, status: "cancelled" } : b,
              ),
            );
          } catch (err) {
            Alert.alert(
              "Error",
              err.response?.data?.message || "Could not cancel",
            );
          }
        },
      },
    ]);
  };

  const openDirections = (room) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${room.lat},${room.lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const date = new Date(b.booking_date);
    if (search && !b.room_name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filter === "This Month")
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    if (filter === "Last Month") {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        date.getMonth() === last.getMonth() &&
        date.getFullYear() === last.getFullYear()
      );
    }
    if (filter === "Confirmed") return b.status === "confirmed";
    if (filter === "Cancelled") return b.status === "cancelled";
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner message="Loading your bookings..." />;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Fixed header — title, search, filters */}
      <View style={styles.fixedHeader}>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.searchWrapper}>
          <TextInput
            placeholder="Search by room name..."
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              setPage(1);
            }}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            style={styles.search}
            left={<TextInput.Icon icon="magnify" color={colors.placeholder} />}
            placeholderTextColor={colors.placeholder}
            theme={{
              colors: {
                primary: "transparent",
                onSurfaceVariant: colors.placeholder,
              },
            }}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => {
                setFilter(f);
                setPage(1);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.chipText, filter === f && styles.chipTextActive]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Results */}
        {paginated.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters or search
            </Text>
          </View>
        ) : (
          paginated.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={() => handleCancel(booking.id)}
              onDirections={() => openDirections(booking)}
              onRebook={() =>
                navigation.navigate("Home", {
                  screen: "Booking",
                  params: {
                    room: {
                      id: booking.room_id,
                      name: booking.room_name,
                      address: booking.address,
                      price_per_day: booking.total_amount,
                      lat: booking.lat,
                      lng: booking.lng,
                    },
                  },
                })
              }
            />
          ))
        )}

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
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 48 },

  fixedHeader: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 4,
  },

  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
    marginBottom: 16,
  },

  /* Search */
  searchWrapper: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    marginBottom: 14,
  },
  search: {
    backgroundColor: "transparent",
    fontSize: 14,
  },

  /* Filter chips */
  filterRow: { marginBottom: 20 },
  filterContent: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: "rgba(40,55,70,0.7)",
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  /* Empty state */
  emptyContainer: {
    alignItems: "center",
    marginTop: 64,
    gap: 8,
  },
  emptyTitle: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "rgba(40,55,70,0.5)",
    fontSize: 13,
  },
});

export default MyBookingsScreen;
