import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";
import { useFocusEffect } from "@react-navigation/native";

const DashboardScreen = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings]),
  );

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/owner/me");
      setBookings(res.data.bookings);
    } catch {
    } finally {
      setLoading(false);
    }
  };

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

  const statusColor = (status) => {
    if (status === "confirmed") return colors.success;
    if (status === "cancelled") return colors.error;
    return colors.warning;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={[
            colors.gradientStart,
            colors.gradientMid,
            colors.gradientEnd,
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Fixed header */}
      <View style={styles.fixedHeader}>
        <Text style={styles.title}>Hey, {user?.name}</Text>
        <Text style={styles.subtitle}>Here's your overview</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
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
        {/* Stat cards */}
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

        {/* Recent bookings */}
        <Text style={styles.sectionTitle}>Recent Bookings</Text>

        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>
              Bookings will appear here once your rooms are listed
            </Text>
          </View>
        ) : (
          bookings.slice(0, 5).map((b) => (
            <View key={b.id} style={styles.bookingRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.bookingRoom} numberOfLines={1}>
                  {b.room_name}
                </Text>
                <Text style={styles.bookingDate}>
                  {new Date(b.booking_date).toDateString()}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: `${statusColor(b.status)}18` },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: statusColor(b.status) }]}
                >
                  {b.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  fixedHeader: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },

  /* Header */
  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
  },

  /* Stat cards */
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statValue: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  statLabel: {
    color: "rgba(40,55,70,0.6)",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
    letterSpacing: 0.2,
  },

  /* Section title */
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
    marginBottom: 12,
    marginTop: 8,
  },

  /* Booking rows */
  bookingRow: {
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  bookingRoom: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 3,
  },
  bookingDate: {
    color: "rgba(40,55,70,0.55)",
    fontSize: 12,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "capitalize",
  },

  /* Empty state */
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    gap: 8,
  },
  emptyTitle: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "rgba(40,55,70,0.5)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default DashboardScreen;
