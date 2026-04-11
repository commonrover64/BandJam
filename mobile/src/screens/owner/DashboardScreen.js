import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const DashboardScreen = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/owner/me");
        setBookings(res.data.bookings);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // filter this week's bookings
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  const thisWeek = bookings.filter((b) => {
    const d = new Date(b.booking_date);
    return d >= weekStart && b.status !== "cancelled";
  });

  const totalEarnings = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);

  const weekEarnings = thisWeek
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + parseFloat(b.total_amount), 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.lavender} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Hey, {user?.name} 👋
      </Text>
      <Text style={styles.subtitle}>Here's your overview</Text>

      {/* stat cards */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{thisWeek.length}</Text>
          <Text style={styles.statLabel}>This Week's Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{weekEarnings}</Text>
          <Text style={styles.statLabel}>This Week's Earnings</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>₹{totalEarnings}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
      </View>

      {/* recent bookings */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Recent Bookings
      </Text>
      {bookings.length === 0 ? (
        <Text style={styles.empty}>No bookings yet.</Text>
      ) : (
        bookings.slice(0, 5).map((b) => (
          <View key={b.id} style={styles.bookingRow}>
            <View>
              <Text style={styles.bookingRoom}>{b.room_name}</Text>
              <Text style={styles.bookingDate}>
                📅 {new Date(b.booking_date).toDateString()}
              </Text>
            </View>
            <Text
              style={{
                color:
                  b.status === "confirmed"
                    ? colors.green
                    : b.status === "cancelled"
                      ? colors.red
                      : colors.yellow,
                fontWeight: "bold",
                fontSize: 12,
              }}
            >
              {b.status}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: colors.base },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
  title: { fontWeight: "bold", marginTop: 48, color: colors.text },
  subtitle: { color: colors.subtext, marginBottom: 24 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface0,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: { color: colors.lavender, fontSize: 24, fontWeight: "bold" },
  statLabel: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
  },
  bookingRow: {
    backgroundColor: colors.surface0,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingRoom: {
    color: colors.text,
    fontWeight: "bold",
  },
  bookingDate: {
    color: colors.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    color: colors.overlay,
    textAlign: "center",
    marginTop: 24,
  },
});

export default DashboardScreen;
