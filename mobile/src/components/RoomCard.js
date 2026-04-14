import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  View,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

const { width } = Dimensions.get("window");
// 2 column grid with padding and gap
const CARD_WIDTH = (width - 48 - 12) / 2;

const RoomCard = ({ room, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* image or gradient fallback */}
      {room.image_url ? (
        <Image source={{ uri: room.image_url }} style={styles.image} />
      ) : (
        <LinearGradient
          colors={[colors.sapphire, colors.mauve]}
          style={styles.image}
        />
      )}

      {/* subtle gradient over bottom of image */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={styles.imageOverlay}
      />

      {/* price badge top right */}
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>₹{room.price_per_day}</Text>
      </View>

      {/* info below image */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {room.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          📍 {room.address}
        </Text>
        {room.distance_km && (
          <Text style={styles.distance}>{room.distance_km} km away</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface0,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: { width: "100%", height: 120 },
  imageOverlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    height: 60,
  },
  priceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  priceText: { color: colors.green, fontSize: 11, fontWeight: "bold" },
  info: { padding: 10 },
  name: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 3,
  },
  address: { color: colors.subtext, fontSize: 11, marginBottom: 2 },
  distance: { color: colors.sapphire, fontSize: 11 },
});

export default RoomCard;
