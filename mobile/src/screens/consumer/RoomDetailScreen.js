import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { Linking } from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const { width } = Dimensions.get("window");

const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data.room);
      } catch {
        Alert.alert("Error", "Could not load room details");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  const openDirections = async () => {
    const loc = await Location.getCurrentPositionAsync({});
    const url = `https://www.google.com/maps/dir/?api=1&origin=${loc.coords.latitude},${loc.coords.longitude}&destination=${room.lat},${room.lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const photos = room.image_url || [];
  const coordinate = {
    latitude: parseFloat(room.lat),
    longitude: parseFloat(room.lng),
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Photo carousel */}
        {photos.length > 0 ? (
          <View style={styles.carouselContainer}>
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => i.toString()}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / width,
                );
                setActivePhoto(index);
              }}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.photo} />
              )}
            />
            {photos.length > 1 && (
              <View style={styles.dots}>
                {photos.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activePhoto && styles.dotActive]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noPhoto}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientMid]}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.noPhotoText}>No photos yet</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{room.name}</Text>

        {/* Info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>PRICE</Text>
              <Text style={[styles.infoValue, { color: colors.primary }]}>
                ₹{room.price_per_day}/day
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>OWNER</Text>
              <Text style={styles.infoValue}>{room.owner_name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>ADDRESS</Text>
          <Text style={[styles.infoValue, { marginBottom: 14 }]}>
            {room.address}
          </Text>

          <Text style={styles.infoLabel}>CONTACT</Text>
          <Text style={styles.infoValue}>{room.phone}</Text>

          {room.description && (
            <>
              <Text style={[styles.infoLabel, { marginTop: 14 }]}>ABOUT</Text>
              <Text style={styles.infoValue}>{room.description}</Text>
            </>
          )}
        </View>

        {/* Map */}
        <MapView
          style={styles.map}
          initialRegion={{
            ...coordinate,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={coordinate} title={room.name} />
        </MapView>

        {/* Directions button */}
        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={openDirections}
          activeOpacity={0.85}
        >
          <Text style={styles.directionsBtnText}>Get Directions</Text>
        </TouchableOpacity>

        {/* Book button */}
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigation.navigate("Booking", { room })}
          activeOpacity={0.85}
        >
          <Text style={styles.bookBtnText}>BOOK THIS ROOM</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 48 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Back */
  back: {
    paddingHorizontal: 24,
    marginTop: 56,
    marginBottom: 16,
  },
  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  /* Photo carousel */
  carouselContainer: { marginBottom: 20 },
  photo: { width, height: 260, resizeMode: "cover" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(46,63,82,0.25)",
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
  noPhoto: {
    height: 200,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  noPhotoText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  /* Title */
  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 24,
    letterSpacing: 0.2,
    marginBottom: 16,
    paddingHorizontal: 24,
  },

  /* Info card */
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.30)",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  infoItem: { flex: 1 },
  infoLabel: {
    color: "rgba(50,65,80,0.6)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.textDark,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 14,
  },

  /* Map */
  map: {
    height: 180,
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },

  /* Directions button */
  directionsBtn: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 10,
  },
  directionsBtnText: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  /* Book button */
  bookBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 24,
    shadowColor: "#2e4a60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 2.5,
  },
});

export default RoomDetailScreen;