import React from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.72;

const RoomCarousel = ({ rooms, onPress }) => {
  if (!rooms.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {rooms.map((room) => (
        <TouchableOpacity
          key={room.id}
          style={styles.card}
          onPress={() => onPress(room)}
          activeOpacity={0.9}
        >
          {room.image_url ? (
            <Image source={{ uri: room.image_url }} style={styles.image} />
          ) : (
            // fallback gradient if no image
            <LinearGradient
              colors={[colors.mauve, colors.blue]}
              style={styles.image}
            />
          )}

          {/* gradient overlay so text is readable over image */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.75)"]}
            style={styles.overlay}
          >
            <Text style={styles.name} numberOfLines={1}>
              {room.name}
            </Text>
            <View style={styles.row}>
              <Text style={styles.address} numberOfLines={1}>
                📍 {room.address}
              </Text>
              <Text style={styles.price}>₹{room.price_per_day}/day</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 4, paddingBottom: 8 },
  card: {
    width: CARD_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 14,
    backgroundColor: colors.surface0,
  },
  image: { width: "100%", height: "100%", position: "absolute" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  name: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  address: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  price: { color: colors.green, fontWeight: "bold", fontSize: 13 },
});

export default RoomCarousel;
