import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const statusColor = (status) => {
  if (status === "confirmed") return colors.green;
  if (status === "cancelled") return colors.red;
  return colors.yellow;
};

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/consumer/me");
        setBookings(res.data.bookings);
      } catch (err) {
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
        text: "Yes, Cancel",
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.lavender} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        My Bookings
      </Text>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>No bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* status pill */}
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: statusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>

              <Text variant="titleMedium" style={styles.roomName}>
                {item.room_name}
              </Text>
              <Text style={styles.detail}>📍 {item.address}</Text>
              <Text style={styles.detail}>
                📅 {new Date(item.booking_date).toDateString()}
              </Text>
              <Text style={styles.detail}>💰 ₹{item.total_amount}</Text>

              {/* owner info */}
              <View style={styles.ownerBox}>
                <Text style={styles.ownerLabel}>Owner Details</Text>
                <Text style={styles.detail}>👤 {item.owner_name}</Text>
                <Text style={styles.detail}>📞 {item.room_phone}</Text>
              </View>

              {item.status === "pending" && (
                <Button
                  mode="outlined"
                  onPress={() => handleCancel(item.id)}
                  textColor={colors.red}
                  style={styles.cancelBtn}
                >
                  Cancel Booking
                </Button>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.base },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 48,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: { color: colors.base, fontSize: 12, fontWeight: "bold" },
  roomName: { color: colors.text, fontWeight: "bold", marginBottom: 8 },
  detail: { color: colors.subtext, marginBottom: 4 },
  ownerBox: {
    backgroundColor: colors.surface1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  ownerLabel: { color: colors.lavender, fontWeight: "bold", marginBottom: 6 },
  cancelBtn: { marginTop: 8, borderColor: colors.red },
  empty: { color: colors.overlay, textAlign: "center", marginTop: 48 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
});

export default MyBookingsScreen;
