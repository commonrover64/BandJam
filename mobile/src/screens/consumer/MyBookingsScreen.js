import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Text, Button, ActivityIndicator, TextInput } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import api from "../../services/api";
import BookingCard from "../../components/BookingCard";
import PaginationBar from "../../components/PaginationBar";
import SectionHeader from "../../components/SectionHeader";
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

  useEffect(() => {
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
    fetchBookings();
  }, []);

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

  // apply filters
  const now = new Date();
  const filtered = bookings.filter((b) => {
    const date = new Date(b.booking_date);

    // text search by room name
    if (search && !b.room_name.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (filter === "This Month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }
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

  // pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner message="Loading your bookings..." />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text variant="headlineMedium" style={styles.title}>
        My Bookings
      </Text>

      {/* search bar */}
      <TextInput
        placeholder="Search by room name..."
        value={search}
        onChangeText={(v) => {
          setSearch(v);
          setPage(1);
        }}
        style={styles.search}
        left={<TextInput.Icon icon="magnify" color={colors.overlay} />}
        placeholderTextColor={colors.overlay}
        theme={{
          colors: {
            primary: colors.lavender,
            onSurfaceVariant: colors.subtext,
          },
        }}
      />

      {/* filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => {
              setFilter(f);
              setPage(1);
            }}
          >
            <Text
              style={[styles.chipText, filter === f && styles.chipTextActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* results */}
      {paginated.length === 0 ? (
        <Text style={styles.empty}>No bookings found.</Text>
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: 24, paddingBottom: 40 },
  title: {
    fontWeight: "bold",
    marginTop: 48,
    color: colors.text,
    marginBottom: 16,
  },
  search: {
    backgroundColor: colors.surface0,
    marginBottom: 12,
    borderRadius: 12,
  },
  filterRow: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface0,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.lavender },
  chipText: { color: colors.subtext, fontSize: 13 },
  chipTextActive: { color: colors.base, fontWeight: "bold" },
  empty: { color: colors.overlay, textAlign: "center", marginTop: 48 },
});

export default MyBookingsScreen;
