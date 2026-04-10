import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
} from "react-native-paper";
import api from "../../services/api";

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

  // color code booking status
  const statusColor = (status) => {
    if (status === "confirmed") return "green";
    if (status === "cancelled") return "red";
    return "orange";
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
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
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.room_name}</Text>
                <Text variant="bodySmall" style={styles.address}>
                  {item.address}
                </Text>
                <Text variant="bodyMedium">
                  📅 {new Date(item.booking_date).toDateString()}
                </Text>
                <Text variant="bodyMedium">₹{item.total_amount}</Text>
                <Chip
                  style={{
                    marginTop: 8,
                    alignSelf: "flex-start",
                    backgroundColor: statusColor(item.status),
                  }}
                  textStyle={{ color: "#fff" }}
                >
                  {item.status}
                </Chip>
              </Card.Content>
              {item.status === "pending" && (
                <Card.Actions>
                  <Button onPress={() => handleCancel(item.id)} textColor="red">
                    Cancel
                  </Button>
                </Card.Actions>
              )}
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontWeight: "bold", marginBottom: 16, marginTop: 48 },
  card: { marginBottom: 12 },
  address: { color: "gray", marginVertical: 4 },
  empty: { color: "gray", textAlign: "center", marginTop: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default MyBookingsScreen;
