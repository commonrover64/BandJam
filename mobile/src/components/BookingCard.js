import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";

const isExpired = (bookingDate) =>
  new Date(bookingDate) < new Date(new Date().toDateString());

const statusLabel = (status, bookingDate) => {
  if (status === "cancelled") return "Cancelled";
  if (status === "confirmed" && isExpired(bookingDate)) return "Completed";
  if (status === "confirmed") return "Confirmed";
  return "Pending";
};

const statusColor = (status, bookingDate) => {
  if (status === "cancelled") return { bg: "rgba(217,83,79,0.15)", text: colors.error };
  if (status === "confirmed" && isExpired(bookingDate)) return { bg: "rgba(74,104,128,0.15)", text: colors.primary };
  if (status === "confirmed") return { bg: "rgba(90,158,124,0.15)", text: colors.success };
  return { bg: "rgba(201,147,58,0.15)", text: colors.warning };
};

const BookingCard = ({ booking, onCancel, onDirections, onRebook }) => {
  const [showMap, setShowMap] = useState(false);
  const navigation = useNavigation();
  const hasLocation = booking.lat && booking.lng;
  const { bg, text: statusText } = statusColor(booking.status, booking.booking_date);

  return (
    <View style={styles.card}>

      {/* Status pill */}
      <View style={[styles.pill, { backgroundColor: bg }]}>
        <Text style={[styles.pillText, { color: statusText }]}>
          {statusLabel(booking.status, booking.booking_date)}
        </Text>
      </View>

      {/* Room name — tappable */}
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("Home", {
            screen: "RoomDetail",
            params: { roomId: booking.room_id },
          })
        }
      >
        <Text style={styles.roomName}>{booking.room_name} →</Text>
      </TouchableOpacity>

      {/* Details */}
      <View style={styles.detailsBlock}>
        <Row label="DATE" value={new Date(booking.booking_date).toDateString()} />
        <Row label="ADDRESS" value={booking.address} />
        <Row label="AMOUNT" value={`₹${booking.total_amount}`} accent />
      </View>

      {/* Owner box */}
      <View style={styles.ownerBox}>
        <Text style={styles.ownerLabel}>OWNER</Text>
        <Text style={styles.ownerValue}>{booking.owner_name}</Text>
        <Text style={styles.ownerSub}>{booking.room_phone}</Text>
      </View>

      {/* Map toggle */}
      {hasLocation && (
        <>
          <TouchableOpacity
            style={styles.mapToggle}
            onPress={() => setShowMap((p) => !p)}
            activeOpacity={0.8}
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

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onDirections}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Rebook */}
      {booking.status !== "pending" && onRebook && (
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={onRebook}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Rebook This Room</Text>
        </TouchableOpacity>
      )}

      {/* Cancel */}
      {booking.status !== "cancelled" &&
        new Date(booking.booking_date) >= new Date(new Date().toDateString()) && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
    </View>
  );
};

/* Small helper for label/value rows */
const Row = ({ label, value, accent }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={[rowStyles.value, accent && { color: colors.primary, fontWeight: "700" }]}>
      {value}
    </Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: { marginBottom: 8 },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.55)",
    fontWeight: "700",
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: "500",
    lineHeight: 18,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  /* Status pill */
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  /* Room name */
  roomName: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  /* Details block */
  detailsBlock: {
    marginBottom: 12,
  },

  /* Owner box */
  ownerBox: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  ownerLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.55)",
    fontWeight: "700",
    marginBottom: 4,
  },
  ownerValue: {
    color: colors.textDark,
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 2,
  },
  ownerSub: {
    color: "rgba(40,55,70,0.55)",
    fontSize: 12,
  },

  /* Map toggle */
  mapToggle: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 10,
  },
  mapToggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  /* Map */
  map: {
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },

  /* Secondary button (Directions, Rebook) */
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  secondaryBtnText: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },

  /* Cancel button */
  cancelBtn: {
    borderWidth: 1,
    borderColor: "rgba(217,83,79,0.4)",
    backgroundColor: "rgba(217,83,79,0.08)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 2,
  },
  cancelBtnText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

export default BookingCard;