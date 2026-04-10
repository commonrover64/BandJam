import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../theme/colors";

const RoomCard = ({ room, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <Text variant="titleMedium" style={styles.name}>
          {room.name}
        </Text>
        <Text variant="bodyMedium" style={styles.price}>
          ₹{room.price_per_day}/day
        </Text>
      </View>
      <Text variant="bodySmall" style={styles.address}>
        📍 {room.address}
      </Text>
      {room.distance_km && (
        <Text variant="bodySmall" style={styles.distance}>
          {room.distance_km} km away
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { color: colors.text, fontWeight: "bold", flex: 1 },
  price: { color: colors.green, fontWeight: "bold" },
  address: { color: colors.subtext, marginBottom: 4 },
  distance: { color: colors.sapphire },
});

export default RoomCard;
