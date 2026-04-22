import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const MAX_PHOTOS = 3;

const CreateRoomScreen = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
    if (!result.canceled) setImages((prev) => [...prev, result.assets[0]]);
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
    if (!result.canceled) setImages((prev) => [...prev, result.assets[0]]);
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
      // silently fail
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
      Alert.alert("Success", "Room listed successfully!");
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

  const inputTheme = {
    colors: {
      primary: "transparent",
      onSurfaceVariant: colors.placeholder,
      error: colors.error,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Fixed title */}
      <Text style={styles.title}>List a Room</Text>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo section */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            ROOM PHOTOS ({images.length}/{MAX_PHOTOS})
          </Text>

          <View style={styles.photoGrid}>
            {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
              const img = images[index];
              return img ? (
                // Filled slot
                <View key={index} style={styles.photoSlot}>
                  <Image source={{ uri: img.uri }} style={styles.slotImage} />
                  {index === 0 && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>MAIN</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Empty slot
                <TouchableOpacity
                  key={index}
                  style={styles.photoSlot}
                  onPress={pickFromGallery}
                  activeOpacity={0.75}
                >
                  <View style={styles.emptySlotInner}>
                    <Text style={styles.emptyPlus}>+</Text>
                    <Text style={styles.emptySlotText}>
                      {index === 0 ? "Add Main Photo" : "Add Photo"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Camera option */}
          <TouchableOpacity
            style={styles.cameraRow}
            onPress={takePhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.cameraText}>Take a photo instead</Text>
          </TouchableOpacity>
        </View>

        {/* Room details card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>ROOM DETAILS</Text>

          <Text style={styles.fieldLabel}>ROOM NAME</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. Studio A, Jam Room..."
              placeholderTextColor={colors.placeholder}
              value={name}
              onChangeText={(v) => {
                setName(v);
                setErrors((e) => ({ ...e, name: null }));
              }}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              theme={inputTheme}
              error={!!errors.name}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Optional — what makes this space special?"
              placeholderTextColor={colors.placeholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={[
                styles.input,
                { minHeight: 80, textAlignVertical: "top" },
              ]}
              theme={inputTheme}
            />
          </View>

          <Text style={styles.fieldLabel}>PHONE</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Contact number"
              placeholderTextColor={colors.placeholder}
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                setErrors((e) => ({ ...e, phone: null }));
              }}
              keyboardType="phone-pad"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              theme={inputTheme}
              error={!!errors.phone}
            />
          </View>
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <Text style={styles.fieldLabel}>PRICE PER DAY (₹)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="e.g. 500"
              placeholderTextColor={colors.placeholder}
              value={price}
              onChangeText={(v) => {
                setPrice(v);
                setErrors((e) => ({ ...e, price: null }));
              }}
              keyboardType="numeric"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              theme={inputTheme}
              error={!!errors.price}
            />
          </View>
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>

        {/* Location card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>LOCATION</Text>

          {/* Address mode toggle */}
          <View style={styles.addressToggle}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                addressMode === "text" && styles.toggleActive,
              ]}
              onPress={() => setAddressMode("text")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  addressMode === "text" && styles.toggleTextActive,
                ]}
              >
                Type Address
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                addressMode === "map" && styles.toggleActive,
              ]}
              onPress={() => setAddressMode("map")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.toggleText,
                  addressMode === "map" && styles.toggleTextActive,
                ]}
              >
                Pin on Map
              </Text>
            </TouchableOpacity>
          </View>

          {addressMode === "text" ? (
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Full address"
                  placeholderTextColor={colors.placeholder}
                  value={address}
                  onChangeText={(v) => {
                    setAddress(v);
                    setErrors((e) => ({ ...e, address: null }));
                  }}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  style={styles.input}
                  theme={inputTheme}
                  error={!!errors.address}
                />
              </View>
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
              <Text style={styles.hint}>
                Switch to map mode to pin exact coordinates
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
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
              {address ? (
                <Text style={styles.autoAddress}>{address}</Text>
              ) : (
                <Text style={styles.hint}>Tap map to auto-fill address</Text>
              )}
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>
            {loading ? "LISTING…" : "LIST ROOM"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },

  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  /* Cards */
  card: {
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.55)",
    fontWeight: "700",
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.55)",
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },

  /* Input */
  inputWrapper: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    marginBottom: 2,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 2,
  },
  hint: {
    color: "rgba(40,55,70,0.45)",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },

  /* Photo section */
  photoGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  photoSlot: {
    flex: 1,
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  slotImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  emptySlotInner: {
    flex: 1,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  emptyPlus: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: "300",
    lineHeight: 26,
  },
  emptySlotText: {
    fontSize: 10,
    color: "rgba(40,55,70,0.5)",
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  mainBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mainBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtnText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  cameraRow: {
    alignItems: "center",
    paddingVertical: 6,
  },
  cameraText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  /* Address toggle */
  addressToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { color: "rgba(40,55,70,0.65)", fontSize: 13, fontWeight: "600" },
  toggleTextActive: { color: "#fff", fontWeight: "700" },

  /* Map */
  map: {
    height: 220,
    borderRadius: 14,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  coordText: {
    color: "rgba(40,55,70,0.5)",
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  autoAddress: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  /* Submit */
  submitBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#2e4a60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 2.5,
  },
});

export default CreateRoomScreen;
