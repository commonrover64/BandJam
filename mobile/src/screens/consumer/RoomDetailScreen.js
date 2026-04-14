import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import api from "../../services/api";
import { colors } from "../../theme/colors";
import { Linking } from "react-native";
import * as Location from "expo-location";

const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data.room);
      } catch (err) {
        Alert.alert("Error", "Could not load room details");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.lavender} />
      </View>
    );
  }

  const openDirections = async () => {
    // get current user location
    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    // build google maps directions URL
    const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${room.lat},${room.lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  const coordinate = {
    latitude: parseFloat(room.lat),
    longitude: parseFloat(room.lng),
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text variant="headlineMedium" style={styles.title}>
        {room.name}
      </Text>

      {/* full interactive map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        // fully interactive — user can zoom, pan
      >
        <Marker coordinate={coordinate} title={room.name} />
      </MapView>

      <TouchableOpacity style={styles.directionsBtn} onPress={openDirections}>
        <Text style={styles.directionsBtnText}>🧭 Get Directions</Text>
      </TouchableOpacity>

      {/* room info */}
      <View style={styles.infoCard}>
        <Text variant="bodyMedium" style={styles.label}>
          📍 Address
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {room.address}
        </Text>

        <Text variant="bodyMedium" style={styles.label}>
          💰 Price
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.value, { color: colors.green }]}
        >
          ₹{room.price_per_day} / day
        </Text>

        <Text variant="bodyMedium" style={styles.label}>
          📞 Contact
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {room.phone}
        </Text>

        <Text variant="bodyMedium" style={styles.label}>
          👤 Owner
        </Text>
        <Text variant="bodyMedium" style={styles.value}>
          {room.owner_name}
        </Text>

        {room.description && (
          <>
            <Text variant="bodyMedium" style={styles.label}>
              📝 About
            </Text>
            <Text variant="bodyMedium" style={styles.value}>
              {room.description}
            </Text>
          </>
        )}
      </View>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate("Booking", { room })}
      >
        Book This Room
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: colors.base },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
  back: { marginTop: 48, marginBottom: 12 },
  backText: { color: colors.lavender, fontSize: 16 },
  title: { fontWeight: "bold", color: colors.text, marginBottom: 16 },
  map: { height: 240, borderRadius: 12, marginBottom: 16 },
  infoCard: {
    backgroundColor: colors.surface0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  label: { color: colors.subtext, marginTop: 12, fontSize: 12 },
  value: { color: colors.text, marginTop: 2 },
  button: { paddingVertical: 4, marginBottom: 32 },

  directionsBtn: {
    backgroundColor: colors.blue,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  directionsBtnText: { color: colors.base, fontWeight: "bold", fontSize: 15 },
});

export default RoomDetailScreen;
