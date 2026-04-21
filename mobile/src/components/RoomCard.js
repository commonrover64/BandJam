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
const CARD_WIDTH = (width - 48 - 12) / 2;

const RoomCard = ({ room, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Image or gradient fallback */}
      {room.image_url ? (
        <Image source={{ uri: room.image_url[0] }} style={styles.image} />
      ) : (
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid]}
          style={styles.image}
        />
      )}

      {/* Gradient overlay over bottom of image */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)"]}
        style={styles.imageOverlay}
      />

      {/* Price badge */}
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>₹{room.price_per_day}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {room.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {room.address}
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
    backgroundColor: "rgba(255, 255, 255, 0.30)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  image: {
    width: "100%",
    height: 100,
  },
  imageOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 50,
  },
  priceBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(46, 64, 88, 0.72)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  priceText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  info: {
    padding: 10,
  },
  name: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 12,
    marginBottom: 3,
  },
  address: {
    color: colors.subtext,
    fontSize: 10,
    marginBottom: 2,
  },
  distance: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "600",
  },
});

export default RoomCard;
