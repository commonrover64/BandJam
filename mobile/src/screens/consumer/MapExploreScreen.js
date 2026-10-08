import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import MapView, { Marker, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { colors } from "../../theme/colors";
import { isValidCoord } from "../../utils/image";

const MapExploreScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission is needed to show rooms near you.");
          return;
        }
        const loc =
          (await Location.getLastKnownPositionAsync()) ??
          (await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }));
        if (cancelled || !loc) return;
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(coords);
        setMapRegion({ ...coords, latitudeDelta: 0.5, longitudeDelta: 0.5 });
        const res = await api.get("/rooms/search", {
          params: { lat: coords.latitude, lng: coords.longitude, radius: 50 },
        });
        if (cancelled) return;
        // a NaN coordinate crashes the native map on Android
        setRooms((res.data?.rooms ?? []).filter((r) => isValidCoord(r.lat, r.lng)));
      } catch {
        if (!cancelled) setError("Couldn't load the map. Check location services and your connection.");
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Header overlay on top of map */}
      <View style={styles.header} pointerEvents="none">
        <LinearGradient
          colors={["rgba(184,201,217,0.92)", "rgba(184,201,217,0)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.title}>Explore Map</Text>
        <Text style={styles.subtitle}>{rooms.length} rooms in this area</Text>
      </View>

      {error && !mapRegion && (
        <View style={styles.errorBox}>
          <Text style={styles.subtitle}>{error}</Text>
        </View>
      )}

      {/* Full-screen map */}
      {mapRegion && (
        <MapView style={styles.map} initialRegion={mapRegion}>
          {/* User location marker */}
          {location && (
            <Marker coordinate={location} pinColor={colors.primary}>
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>You are here</Text>
                </View>
              </Callout>
            </Marker>
          )}

          {/* Room markers */}
          {rooms.map((room) => (
            <Marker
              key={room.id}
              coordinate={{
                latitude: parseFloat(room.lat),
                longitude: parseFloat(room.lng),
              }}
            >
              <Callout
                onPress={() =>
                  navigation.navigate("Home", {
                    screen: "RoomDetail",
                    params: { roomId: room.id },
                  })
                }
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{room.name}</Text>
                  <Text style={styles.calloutPrice}>
                    ₹{room.price_per_day}/day
                  </Text>
                  <Text style={styles.calloutTap}>Tap to view →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Floating header fades into the map */
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontWeight: "700",
    color: colors.textDark,
    fontSize: 26,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  subtitle: {
    color: "rgba(46,63,82,0.6)",
    fontSize: 13,
    letterSpacing: 0.2,
  },

  map: { flex: 1 },
  errorBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },

  /* Callout card */
  callout: {
    padding: 10,
    minWidth: 160,
    borderRadius: 10,
  },
  calloutName: {
    fontWeight: "700",
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 3,
  },
  calloutPrice: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 12,
    marginBottom: 4,
  },
  calloutTap: {
    color: "rgba(46,63,82,0.45)",
    fontSize: 11,
  },
});

export default MapExploreScreen;
