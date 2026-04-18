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

const MAX_PHOTOS = 3;

const CreateRoomScreen = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]); // array of up to 3 image assets
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addressMode, setAddressMode] = useState("text"); // 'text' | 'map'
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

  const pickFromGallery = async () => {
    if (images.length >= MAX_PHOTOS) {
      Alert.alert("Limit reached", `You can upload up to ${MAX_PHOTOS} photos`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo access to upload room image",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= MAX_PHOTOS) {
      Alert.alert("Limit reached", `You can upload up to ${MAX_PHOTOS} photos`);
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow camera access");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMapPress = async (e) => {
    const coords = e.nativeEvent.coordinate;
    setLocation(coords);
    try {
      const result = await Location.reverseGeocodeAsync(coords);
      if (result.length > 0) {
        const r = result[0];
        const readable = [r.name, r.street, r.district, r.city, r.region]
          .filter(Boolean)
          .join(", ");
        setAddress(readable);
        setErrors((prev) => ({ ...prev, address: null }));
      }
    } catch {
      // silently fail — user can type address manually
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
      // append all selected images
      images.forEach((img, index) => {
        formData.append("images", {
          uri: img.uri,
          name: `room_${index + 1}.jpg`,
          type: "image/jpeg",
        });
      });

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
      setImages([]);
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

      {/* photo section */}
      <Text style={styles.label}>
        Room Photos ({images.length}/{MAX_PHOTOS})
      </Text>

      {/* photo previews */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.previewRow}
        >
          {images.map((img, index) => (
            <View key={index} style={styles.previewWrapper}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} />
              {/* remove button */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
              {/* first photo badge */}
              {index === 0 && (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Main</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* add photo buttons — hide when max reached */}
      {images.length < MAX_PHOTOS && (
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
            <Text style={styles.photoBtnIcon}>🖼</Text>
            <Text style={styles.photoBtnText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
            <Text style={styles.photoBtnIcon}>📸</Text>
            <Text style={styles.photoBtnText}>Camera</Text>
          </TouchableOpacity>
          {/* empty slot indicators */}
          {Array.from({ length: MAX_PHOTOS - images.length - 1 }).map(
            (_, i) => (
              <View key={i} style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>+</Text>
              </View>
            ),
          )}
        </View>
      )}

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

      {/* location section */}
      <Text style={styles.label}>Location</Text>

      {/* toggle — text or map */}
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
            💡 Switch to map mode to pin exact coordinates
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.hint}>Tap on the map to drop a pin</Text>
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
            <Text style={styles.hint}>Tap map to auto fill address</Text>
          )}
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
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
  label: {
    color: colors.subtext,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 16,
  },

  // photo section
  previewRow: { marginBottom: 12 },
  previewWrapper: {
    width: 110,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 10,
    position: "relative",
  },
  previewImage: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtnText: { color: colors.white, fontSize: 10, fontWeight: "bold" },
  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: colors.lavender,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mainBadgeText: { color: colors.base, fontSize: 9, fontWeight: "bold" },

  photoActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.surface0,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.surface2,
    borderStyle: "dashed",
  },
  photoBtnIcon: { fontSize: 22 },
  photoBtnText: { color: colors.subtext, fontSize: 12 },
  emptySlot: {
    flex: 1,
    backgroundColor: colors.surface0,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.surface2,
    borderStyle: "dashed",
    opacity: 0.4,
  },
  emptySlotText: { color: colors.overlay, fontSize: 22 },

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
