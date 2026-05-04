import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const BookingRequestsScreen = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, []),
  );

  const fetchRequests = async () => {
    try {
      const res = await api.get("/bookings/owner/me");
      // only show pending bookings
      setRequests(res.data.bookings.filter((b) => b.status === "pending"));
    } catch {
      Alert.alert("Error", "Could not fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/bookings/${id}/approve`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      Alert.alert("Approved", "Booking has been confirmed.");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong",
      );
    }
  };

  const handleDecline = async (id) => {
    Alert.alert("Decline Booking", "Are you sure you want to decline?", [
      { text: "Cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          try {
            await api.patch(`/bookings/${id}/decline`);
            setRequests((prev) => prev.filter((r) => r.id !== id));
          } catch (err) {
            Alert.alert(
              "Error",
              err.response?.data?.message || "Something went wrong",
            );
          }
        },
      },
    ]);
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
      <Text style={styles.title}>Booking Requests</Text>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {requests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No pending requests</Text>
            <Text style={styles.emptySubtitle}>
              New booking requests will appear here
            </Text>
          </View>
        ) : (
          requests.map((req) => (
            <View key={req.id} style={styles.card}>
              <Text style={styles.roomName}>{req.room_name}</Text>
              <Text style={styles.detail}>Consumer: {req.consumer_name}</Text>
              <Text style={styles.detail}>
                Phone: {req.consumer_phone || "Not provided"}
              </Text>
              <Text style={styles.detail}>
                Date: {new Date(req.booking_date).toDateString()}
              </Text>
              <Text style={styles.detail}>Amount: Rs {req.total_amount}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApprove(req.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.approveBtnText}>APPROVE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleDecline(req.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.declineBtnText}>DECLINE</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  content: { padding: 24, paddingBottom: 48 },
  card: {
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  roomName: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  detail: {
    color: "rgba(40,55,70,0.7)",
    fontSize: 13,
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  approveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1.5,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: "rgba(217,83,79,0.12)",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217,83,79,0.3)",
  },
  declineBtnText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 1.5,
  },
  emptyContainer: { alignItems: "center", marginTop: 64, gap: 8 },
  emptyTitle: { color: colors.textDark, fontSize: 16, fontWeight: "700" },
  emptySubtitle: {
    color: "rgba(40,55,70,0.5)",
    fontSize: 13,
    textAlign: "center",
  },
});

export default BookingRequestsScreen;
