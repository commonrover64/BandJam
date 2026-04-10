import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import api from "../../services/api";

const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {room.name}
      </Text>
      <Text variant="bodyMedium" style={styles.address}>
        📍 {room.address}
      </Text>
      <Text variant="bodyMedium" style={styles.price}>
        ₹{room.price_per_day} / day
      </Text>
      <Text variant="bodyMedium" style={styles.phone}>
        📞 {room.phone}
      </Text>

      {room.description && (
        <Text variant="bodyMedium" style={styles.description}>
          {room.description}
        </Text>
      )}

      {/* mini map showing room location */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: parseFloat(room.lat),
          longitude: parseFloat(room.lng),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
      >
        <Marker
          coordinate={{
            latitude: parseFloat(room.lat),
            longitude: parseFloat(room.lng),
          }}
          title={room.name}
        />
      </MapView>

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
  container: { flexGrow: 1, padding: 24, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontWeight: "bold", marginBottom: 8, marginTop: 48 },
  address: { color: "gray", marginBottom: 4 },
  price: { fontWeight: "bold", fontSize: 18, marginBottom: 4 },
  phone: { marginBottom: 12 },
  description: { color: "#444", marginBottom: 16 },
  map: { height: 200, borderRadius: 12, marginBottom: 24 },
  button: { paddingVertical: 4, marginBottom: 32 },
});

export default RoomDetailScreen;
