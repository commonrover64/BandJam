import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { colors } from "../theme/colors";

const statusColor = (status) => {
  if (status === "confirmed") return colors.green;
  if (status === "cancelled") return colors.red;
  return colors.yellow;
};

const BookingCard = ({ booking, onCancel, onDirections, onRebook }) => {
  const [showMap, setShowMap] = useState(false);

  const hasLocation = booking.lat && booking.lng;

  return (
    <View style={styles.card}>
      {/* status pill */}
      <View
        style={[styles.pill, { backgroundColor: statusColor(booking.status) }]}
      >
        <Text style={styles.pillText}>{booking.status}</Text>
      </View>

      <Text style={styles.roomName}>{booking.room_name}</Text>
      <Text style={styles.detail}>
        📅 {new Date(booking.booking_date).toDateString()}
      </Text>
      <Text style={styles.detail}>📍 {booking.address}</Text>
      <Text style={styles.detail}>💰 ₹{booking.total_amount}</Text>

      {/* owner info */}
      <View style={styles.ownerBox}>
        <Text style={styles.ownerLabel}>Owner</Text>
        <Text style={styles.detail}>👤 {booking.owner_name}</Text>
        <Text style={styles.detail}>📞 {booking.room_phone}</Text>
      </View>

      {/* map toggle */}
      {hasLocation && (
        <>
          <TouchableOpacity
            style={styles.mapToggle}
            onPress={() => setShowMap((p) => !p)}
          >
            <Text style={styles.mapToggleText}>
              {showMap ? "Hide Map" : "Show on Map"}
            </Text>
          </TouchableOpacity>

          {showMap && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: parseFloat(booking.lat),
                longitude: parseFloat(booking.lng),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(booking.lat),
                  longitude: parseFloat(booking.lng),
                }}
                title={booking.room_name}
              />
            </MapView>
          )}

          <TouchableOpacity style={styles.directionsBtn} onPress={onDirections}>
            <Text style={styles.directionsBtnText}>🧭 Get Directions</Text>
          </TouchableOpacity>
        </>
      )}

      {booking.status !== "pending" && onRebook && (
        <TouchableOpacity style={styles.rebookBtn} onPress={onRebook}>
          <Text style={styles.rebookText}>🔄 Rebook This Room</Text>
        </TouchableOpacity>
      )}

      {/* cancel button */}
      {booking.status === "pending" && (
        <Button
          mode="outlined"
          onPress={onCancel}
          textColor={colors.red}
          style={styles.cancelBtn}
        >
          Cancel Booking
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface0,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 10,
  },
  pillText: { color: colors.base, fontSize: 11, fontWeight: "bold" },
  roomName: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  detail: { color: colors.subtext, marginBottom: 4, fontSize: 13 },
  ownerBox: {
    backgroundColor: colors.surface1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  ownerLabel: {
    color: colors.lavender,
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 12,
  },
  mapToggle: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.surface1,
    borderRadius: 20,
    marginBottom: 10,
  },
  mapToggleText: { color: colors.lavender, fontSize: 13 },
  map: { height: 160, borderRadius: 12, marginBottom: 10 },
  directionsBtn: {
    backgroundColor: colors.blue,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  directionsBtnText: { color: colors.base, fontWeight: "bold" },
  cancelBtn: { marginTop: 4, borderColor: colors.red },
  rebookBtn: {
    backgroundColor: colors.surface1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  rebookText: { color: colors.lavender, fontWeight: "bold" },
});

export default BookingCard;
