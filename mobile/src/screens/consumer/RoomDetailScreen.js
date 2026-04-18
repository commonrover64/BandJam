import React, { useEffect, useState, useRef } from "react";
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
import { Text, Button, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { Linking } from "react-native";
import * as Location from "expo-location";
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
        <ActivityIndicator size="large" color={colors.lavender} />
      </View>
    );
  }

  // collect all available photos
  const photos = room.image_url || [];

  const coordinate = {
    latitude: parseFloat(room.lat),
    longitude: parseFloat(room.lng),
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {console.log("photos", room)}
      {/* photo carousel */}
      {photos.length > 0 ? (
        <View style={styles.carouselContainer}>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActivePhoto(index);
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.photo} />
            )}
          />
          {/* dots indicator */}
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
        // no photo fallback
        <View style={styles.noPhoto}>
          <Text style={styles.noPhotoText}>🎸 No photos yet</Text>
        </View>
      )}

      <Text variant="headlineMedium" style={styles.title}>
        {room.name}
      </Text>

      {/* info card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={[styles.infoValue, { color: colors.green }]}>
              ₹{room.price_per_day}/day
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Owner</Text>
            <Text style={styles.infoValue}>{room.owner_name}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.infoLabel}>📍 Address</Text>
        <Text style={[styles.infoValue, { marginBottom: 12 }]}>
          {room.address}
        </Text>

        <Text style={styles.infoLabel}>📞 Contact</Text>
        <Text style={styles.infoValue}>{room.phone}</Text>

        {room.description && (
          <>
            <Text style={[styles.infoLabel, { marginTop: 12 }]}>📝 About</Text>
            <Text style={styles.infoValue}>{room.description}</Text>
          </>
        )}
      </View>

      {/* map */}
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

      {/* directions */}
      <TouchableOpacity style={styles.directionsBtn} onPress={openDirections}>
        <Text style={styles.directionsBtnText}>🧭 Get Directions</Text>
      </TouchableOpacity>

      {/* book button */}
      <Button
        mode="contained"
        style={styles.button}
        contentStyle={styles.buttonContent}
        onPress={() => navigation.navigate("Booking", { room })}
      >
        Book This Room
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { paddingBottom: 48 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
  back: { paddingHorizontal: 24, marginTop: 48, marginBottom: 12 },
  backText: { color: colors.lavender, fontSize: 16 },

  // photo carousel
  carouselContainer: { marginBottom: 16 },
  photo: { width, height: 260, resizeMode: "cover" },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surface2,
  },
  dotActive: { backgroundColor: colors.lavender, width: 18 },
  noPhoto: {
    height: 200,
    backgroundColor: colors.surface0,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noPhotoText: { color: colors.overlay, fontSize: 16 },

  title: {
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  infoCard: {
    backgroundColor: colors.surface0,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoItem: { flex: 1 },
  infoLabel: { color: colors.subtext, fontSize: 12, marginBottom: 4 },
  infoValue: { color: colors.text, fontWeight: "bold", fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.surface2, marginBottom: 12 },

  map: {
    height: 180,
    marginHorizontal: 24,
    borderRadius: 14,
    marginBottom: 12,
  },
  directionsBtn: {
    backgroundColor: colors.blue,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
  },
  directionsBtnText: { color: colors.base, fontWeight: "bold" },
  button: { marginHorizontal: 24, borderRadius: 12, marginBottom: 16 },
  buttonContent: { paddingVertical: 6 },
});

export default RoomDetailScreen;
