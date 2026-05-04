import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const BookingScreen = ({ route, navigation }) => {
  const { room } = route.params;
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    try {
      setLoading(true);
      const bookingDate = date.toISOString().split("T")[0];

      // just create booking — no payment API call needed
      await api.post("/bookings", {
        room_id: room.id,
        booking_date: bookingDate,
      });

      Alert.alert(
        "Request Sent",
        `Your booking request for ${room.name} on ${bookingDate} has been sent to the owner. You will be notified once approved.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.title}>Book a Room</Text>

        {/* Room summary card */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>ROOM</Text>
          <Text style={styles.roomName}>{room.name}</Text>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.fieldLabel}>RATE</Text>
              <Text style={styles.priceValue}>₹{room.price_per_day} / day</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.fieldLabel}>TOTAL</Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>
                ₹{room.price_per_day}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date picker */}
          <Text style={styles.fieldLabel}>BOOKING DATE</Text>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.dateText}>{date.toDateString()}</Text>
            <Text style={styles.dateChevron}>›</Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleBooking}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmText}>
            {loading ? "Sending Request" : "Request Booking"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  /* Back */
  back: { marginBottom: 24 },
  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  /* Title */
  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
    marginBottom: 20,
  },

  /* Card */
  card: {
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 20,
  },

  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.6)",
    fontWeight: "700",
    marginBottom: 6,
  },

  roomName: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.2,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 16,
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  priceValue: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 16,
  },

  /* Date picker row */
  datePicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  dateText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: "500",
  },
  dateChevron: {
    color: colors.placeholder,
    fontSize: 20,
    lineHeight: 22,
  },

  /* Confirm button */
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#2e4a60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 2.5,
  },
});

export default BookingScreen;
