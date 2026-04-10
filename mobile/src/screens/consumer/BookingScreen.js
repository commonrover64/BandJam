import React, { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { Text, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../services/api";

const BookingScreen = ({ route, navigation }) => {
  const { room } = route.params;
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBooking = async () => {
    try {
      setLoading(true);
      // format date as YYYY-MM-DD for backend
      const bookingDate = date.toISOString().split("T")[0];
      const bookingRes = await api.post("/bookings", {
        room_id: room.id,
        booking_date: bookingDate,
      });

      // immediately initiate payment after booking
      await api.post("/payments", {
        booking_id: bookingRes.data.booking.id,
        payment_method: "upi",
      });

      Alert.alert(
        "Booking Confirmed!",
        `You've booked ${room.name} on ${bookingDate}`,
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
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Book a Room
      </Text>
      <Text variant="titleMedium" style={styles.roomName}>
        {room.name}
      </Text>
      <Text variant="bodyMedium" style={styles.price}>
        ₹{room.price_per_day} / day
      </Text>

      {/* date picker */}
      <Text variant="bodyLarge" style={styles.label}>
        Select Date
      </Text>
      <Button
        mode="outlined"
        onPress={() => setShowPicker(true)}
        style={styles.dateButton}
      >
        {date.toDateString()}
      </Button>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          minimumDate={new Date()} // can't book in the past
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text variant="bodyMedium" style={styles.total}>
        Total: ₹{room.price_per_day}
      </Text>

      <Button
        mode="contained"
        onPress={handleBooking}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Confirm & Pay
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: { fontWeight: "bold", marginBottom: 8 },
  roomName: { marginBottom: 4 },
  price: { color: "gray", marginBottom: 24 },
  label: { fontWeight: "bold", marginBottom: 8 },
  dateButton: { marginBottom: 16 },
  total: { fontWeight: "bold", fontSize: 18, marginBottom: 24 },
  button: { paddingVertical: 4 },
});

export default BookingScreen;
