import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const CreateRoomScreen = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // address mode: 'text' or 'map'
  const [addressMode, setAddressMode] = useState("text");
  const [location, setLocation] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
  });

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Room name is required";
    if (!address.trim()) e.address = "Address is required";
    if (!phone.trim()) e.phone = "Phone is required";
    if (!price || isNaN(price)) e.price = "Valid price is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow camera access to take a photo");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleMapPress = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setLocation(coords);
    // reverse geocode to fill address
    const result = await Location.reverseGeocodeAsync(coords);
    if (result.length > 0) {
      const r = result[0];
      const readable = [r.name, r.street, r.district, r.city, r.region]
        .filter(Boolean)
        .join(", ");
      setAddress(readable);
    }
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
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

      Alert.alert("Success 🎉", "Room listed successfully!");
      // reset form
      setName("");
      setDescription("");
      setAddress("");
      setPhone("");
      setPrice("");
      setImage(null);
      setErrors({});
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="headlineMedium" style={styles.title}>
        List a Room
      </Text>
      <Text style={styles.subtitle}>Fill in your practice space details</Text>

      {/* image picker section */}
      <Text style={styles.label}>Room Photo</Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={pickImage}
        activeOpacity={0.85}
      >
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imageIcon}>🖼</Text>
            <Text style={styles.imageHint}>Tap to pick from gallery</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* camera option */}
      <View style={styles.imageOptions}>
        <TouchableOpacity style={styles.imageOptionBtn} onPress={pickImage}>
          <Text style={styles.imageOptionText}>📷 Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageOptionBtn} onPress={takePhoto}>
          <Text style={styles.imageOptionText}>📸 Camera</Text>
        </TouchableOpacity>
        {image && (
          <TouchableOpacity
            style={[styles.imageOptionBtn, { borderColor: colors.red }]}
            onPress={() => setImage(null)}
          >
            <Text style={[styles.imageOptionText, { color: colors.red }]}>
              ✕ Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* room details */}
      <Text style={styles.label}>Room Details</Text>

      <TextInput
        label="Room Name"
        value={name}
        onChangeText={(v) => {
          setName(v);
          setErrors((e) => ({ ...e, name: null }));
        }}
        style={styles.input}
        error={!!errors.name}
        theme={{
          colors: {
            primary: colors.lavender,
            onSurfaceVariant: colors.subtext,
          },
        }}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TextInput
        label="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.input}
        theme={{
          colors: {
            primary: colors.lavender,
            onSurfaceVariant: colors.subtext,
          },
        }}
      />

      <TextInput
        label="Phone"
        value={phone}
        onChangeText={(v) => {
          setPhone(v);
          setErrors((e) => ({ ...e, phone: null }));
        }}
        keyboardType="phone-pad"
        style={styles.input}
        error={!!errors.phone}
        theme={{
          colors: {
            primary: colors.lavender,
            onSurfaceVariant: colors.subtext,
          },
        }}
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      <TextInput
        label="Price per Day (₹)"
        value={price}
        onChangeText={(v) => {
          setPrice(v);
          setErrors((e) => ({ ...e, price: null }));
        }}
        keyboardType="numeric"
        style={styles.input}
        error={!!errors.price}
        theme={{
          colors: {
            primary: colors.lavender,
            onSurfaceVariant: colors.subtext,
          },
        }}
      />
      {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}

      {/* address section — toggle between text and map */}
      <Text style={styles.label}>Location</Text>
      <View style={styles.addressToggle}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            addressMode === "text" && styles.toggleActive,
          ]}
          onPress={() => setAddressMode("text")}
        >
          <Text
            style={[
              styles.toggleText,
              addressMode === "text" && styles.toggleTextActive,
            ]}
          >
            ✍️ Type Address
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            addressMode === "map" && styles.toggleActive,
          ]}
          onPress={() => setAddressMode("map")}
        >
          <Text
            style={[
              styles.toggleText,
              addressMode === "map" && styles.toggleTextActive,
            ]}
          >
            📍 Pin on Map
          </Text>
        </TouchableOpacity>
      </View>

      {addressMode === "text" ? (
        // text input mode
        <>
          <TextInput
            label="Full Address"
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              setErrors((e) => ({ ...e, address: null }));
            }}
            style={styles.input}
            error={!!errors.address}
            theme={{
              colors: {
                primary: colors.lavender,
                onSurfaceVariant: colors.subtext,
              },
            }}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
          <Text style={styles.hint}>
            💡 Coordinates will use map center. Switch to map to pin exact
            location.
          </Text>
        </>
      ) : (
        // map pin mode
        <>
          <Text style={styles.hint}>
            Tap on the map to drop a pin. Address auto fills.
          </Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 5,
              longitudeDelta: 5,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={location} />
          </MapView>
          <Text style={styles.coordText}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          {address ? (
            <Text style={styles.autoAddress}>✅ {address}</Text>
          ) : (
            <Text style={styles.hint}>Tap map to get address</Text>
          )}
        </>
      )}

      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        List Room
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: 24, paddingBottom: 48 },
  title: {
    fontWeight: "bold",
    color: colors.text,
    marginTop: 48,
    marginBottom: 4,
  },
  subtitle: { color: colors.subtext, marginBottom: 24 },
  label: { color: colors.subtext, fontSize: 12, marginBottom: 8, marginTop: 8 },

  // image picker
  imagePicker: {
    height: 180,
    backgroundColor: colors.surface0,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderStyle: "dashed",
  },
  imagePreview: { width: "100%", height: "100%" },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imageIcon: { fontSize: 36 },
  imageHint: { color: colors.overlay, fontSize: 13 },
  imageOptions: { flexDirection: "row", gap: 8, marginBottom: 20 },
  imageOptionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surface2,
    alignItems: "center",
  },
  imageOptionText: { color: colors.subtext, fontSize: 13 },

  // form
  input: { marginBottom: 4, backgroundColor: colors.surface0 },
  errorText: { color: colors.red, fontSize: 12, marginBottom: 8 },
  hint: { color: colors.overlay, fontSize: 12, marginBottom: 12 },

  // address toggle
  addressToggle: {
    flexDirection: "row",
    backgroundColor: colors.surface0,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: colors.lavender },
  toggleText: { color: colors.subtext, fontSize: 13, fontWeight: "bold" },
  toggleTextActive: { color: colors.base },

  // map
  map: { height: 220, borderRadius: 14, marginBottom: 8 },
  coordText: { color: colors.overlay, fontSize: 12, marginBottom: 4 },
  autoAddress: { color: colors.green, fontSize: 13, marginBottom: 16 },

  button: { marginTop: 24, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
});

export default CreateRoomScreen;
