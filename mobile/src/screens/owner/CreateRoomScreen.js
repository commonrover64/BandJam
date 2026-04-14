import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../../services/api";
import { colors } from "../../theme/colors";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

const CreateRoomScreen = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // default map location — India center, user can drag pin
  const [location, setLocation] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo access to upload room image",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleCreate = async () => {
    if (!name || !address || !phone || !price) {
      return Alert.alert("Error", "Please fill in all required fields");
    }
    try {
      setLoading(true);

      // use FormData because we're sending an image file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("address", address);
      formData.append("phone", phone);
      formData.append("price_per_day", price);
      formData.append("lat", location.latitude.toString());
      formData.append("lng", location.longitude.toString());

      if (image) {
        formData.append("image", {
          uri: image.uri,
          name: "room.jpg",
          type: "image/jpeg",
        });
      }

      await api.post("/rooms", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Success", "Room listed successfully!");
      setName("");
      setDescription("");
      setAddress("");
      setPhone("");
      setPrice("");
      setImage(null);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        List a Room
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Fill in your practice space details
      </Text>

      <TextInput
        label="Room Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <TextInput
        label="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <TextInput
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        label="Price per Day (₹)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* image picker */}
      <Text style={styles.mapLabel}>Room Photo</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>📷 Tap to add photo</Text>
        )}
      </TouchableOpacity>

      {/* map pin drop for location */}
      <Text variant="bodyMedium" style={styles.mapLabel}>
        Drop a pin on your room location
      </Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
        onPress={async (e) => {
          const coords = e.nativeEvent.coordinate;
          setLocation(coords);

          // reverse geocode — get address from coordinates
          const result = await Location.reverseGeocodeAsync(coords);
          if (result.length > 0) {
            const r = result[0];
            // build a readable address from the result
            const readable = [r.name, r.street, r.district, r.city, r.region]
              .filter(Boolean)
              .join(", ");
            setAddress(readable);
          }
        }}
      >
        <Marker coordinate={location} />
      </MapView>
      <Text variant="bodySmall" style={styles.coords}>
        📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
      </Text>

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        List Room
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.base,
  },
  title: {
    fontWeight: "bold",
    marginTop: 48,
    color: colors.text,
  },
  subtitle: {
    color: colors.subtext,
    marginBottom: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: colors.surface0,
  },
  mapLabel: {
    marginBottom: 8,
    fontWeight: "bold",
    color: colors.text,
  },
  map: {
    height: 220,
    borderRadius: 12,
    marginBottom: 8,
  },
  coords: {
    color: colors.overlay,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
    marginBottom: 32,
  },
});

export default CreateRoomScreen;
