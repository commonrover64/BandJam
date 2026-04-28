import React, { useState, useCallback } from "react";
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
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const MAX_PHOTOS = 3;

const RoomFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // ── Read room param safely ─────────────────────────────
  const roomParam = route.params?.room || null;
  const isEdit = !!roomParam;

  // ── State ─────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]); // newly picked images
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addressMode, setAddressMode] = useState("text");
  const [location, setLocation] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
  });
  const [removedExisting, setRemovedExisting] = useState([]);
  const mapReference = React.useRef(null);

  // ── Initialize / Reset when screen gains focus ───────
  useFocusEffect(
    useCallback(() => {
      if (roomParam) {
        setName(roomParam.name || "");
        setDescription(roomParam.description || "");
        setAddress(roomParam.address || "");
        setPhone(roomParam.phone || "");
        setPrice(roomParam.price_per_day?.toString() || "");
        setLocation({
          latitude: roomParam.lat ? parseFloat(roomParam.lat) : 20.5937,
          longitude: roomParam.lng ? parseFloat(roomParam.lng) : 78.9629,
        });
        setImages([]);
        setRemovedExisting([]);
        setErrors({});
        setAddressMode("text");
      } else {
        setName("");
        setDescription("");
        setAddress("");
        setPhone("");
        setPrice("");
        setImages([]);
        setRemovedExisting([]);
        setLocation({ latitude: 20.5937, longitude: 78.9629 });
        setErrors({});
        setAddressMode("text");
      }
      // no cleanup needed here
    }, [roomParam]),
  );

  const resetToAddMode = () => {
    navigation.setParams({ room: undefined });
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Room name is required";
    if (!address.trim()) e.address = "Address is required";
    if (!phone.trim()) e.phone = "Phone is required";
    if (!price || isNaN(price)) e.price = "Valid price is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const totalPhotoCount = () => {
    const existingKept = (roomParam?.image_url || []).filter(
      (_, i) => !removedExisting.includes(i),
    ).length;
    return existingKept + images.length;
  };

  const canAddPhoto = () => totalPhotoCount() < MAX_PHOTOS;

  const pickFromGallery = async () => {
    if (!canAddPhoto()) {
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
    if (!canAddPhoto()) {
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

  const removeExistingPhoto = (originalIndex) => {
    setRemovedExisting((prev) => [...prev, originalIndex]);
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

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("phone", phone);
    formData.append("price_per_day", price);
    formData.append("lat", location.latitude.toString());
    formData.append("lng", location.longitude.toString());

    if (isEdit && removedExisting.length > 0) {
      removedExisting.forEach((idx) => {
        formData.append("removed_image_indices", idx.toString());
      });
    }

    images.forEach((img, index) => {
      formData.append("images", {
        uri: img.uri,
        name: `room_${index + 1}.jpg`,
        type: "image/jpeg",
      });
    });

    return formData;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await api.post("/rooms", buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Room listed successfully!");
      resetToAddMode(); // clear params so screen returns to add mode
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await api.patch(`/rooms/${roomParam.id}`, buildFormData(), {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", "Room updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            resetToAddMode();
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Photo helpers for rendering ────────────────────────
  const existingPhotos = (roomParam?.image_url || [])
    .map((url, i) => ({
      type: "existing",
      url,
      originalIndex: i,
      isRemoved: removedExisting.includes(i),
    }))
    .filter((p) => !p.isRemoved);

  const newPhotos = images.map((img, i) => ({
    type: "new",
    uri: img.uri,
    index: i,
  }));

  const allPhotos = [...existingPhotos, ...newPhotos];
  const emptySlots = MAX_PHOTOS - allPhotos.length;

  const inputTheme = {
    colors: {
      primary: "transparent",
      onSurfaceVariant: colors.placeholder,
      error: colors.error,
    },
  };

  // Get user's current GPS location and set marker there
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      setLocation(coords); // move marker to user location
      mapReference.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    } catch (err) {
      console.log("Location error:", err);
    }
  };

  // ── Render
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* header */}
      {isEdit && (
        <TouchableOpacity
          onPress={() => {
            resetToAddMode();
            navigation.goBack();
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.title, isEdit && { paddingTop: 8 }]}>
        {isEdit ? "Edit Room" : "List a Room"}
      </Text>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photos card */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>
            {isEdit ? "ROOM PHOTOS" : "ROOM PHOTOS"} ({allPhotos.length}/
            {MAX_PHOTOS})
          </Text>

          {/* Photo grid: existing + new + empty slots */}
          <View style={styles.photoGrid}>
            {allPhotos.map((photo, displayIndex) => (
              <View
                key={`${photo.type}-${photo.type === "existing" ? photo.originalIndex : photo.index}`}
                style={styles.previewWrapper}
              >
                <Image
                  source={{
                    uri: photo.type === "existing" ? photo.url : photo.uri,
                  }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() =>
                    photo.type === "existing"
                      ? removeExistingPhoto(photo.originalIndex)
                      : removeImage(photo.index)
                  }
                >
                  <Text style={styles.removeBtnText}>✕</Text>
                </TouchableOpacity>
                {displayIndex === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>MAIN</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Empty slots become add buttons */}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <TouchableOpacity
                key={`empty-${i}`}
                style={styles.photoSlot}
                onPress={pickFromGallery}
                activeOpacity={0.75}
              >
                <Text style={styles.emptyPlus}>+</Text>
                <Text style={styles.emptySlotText}>
                  {allPhotos.length === 0 && i === 0 ? "Add Main" : "Add Photo"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Camera option only if there's room */}
          {canAddPhoto() && (
            <TouchableOpacity
              style={styles.cameraRow}
              onPress={takePhoto}
              activeOpacity={0.8}
            >
              <Text style={styles.cameraText}>Take a photo instead</Text>
            </TouchableOpacity>
          )}
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
              onPress={() => {
                setAddressMode("map");
                setTimeout(() => {
                  (getCurrentLocation(), 150);
                });
              }}
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
              <Text style={styles.hint}>
                {isEdit
                  ? "Tap to move the pin"
                  : "Tap on the map to drop a pin"}
              </Text>
              <MapView
                ref={mapReference}
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
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
          onPress={isEdit ? handleSave : handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>
            {loading
              ? isEdit
                ? "SAVING…"
                : "LISTING…"
              : isEdit
                ? "SAVE CHANGES"
                : "LIST ROOM"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Fixed header */
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 4,
    alignSelf: "flex-start",
  },
  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },

  content: { paddingHorizontal: 24, paddingBottom: 48 },

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

  /* Inputs */
  inputWrapper: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    marginBottom: 2,
  },
  input: { backgroundColor: "transparent", fontSize: 14 },
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

  /* Photo section — unified grid */
  photoGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  previewWrapper: {
    width: 110,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  previewImage: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mainBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
  photoSlot: {
    width: 90,
    height: 80,
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
  },
  cameraRow: { alignItems: "center", paddingVertical: 4 },
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
  toggleBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center" },
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

export default RoomFormScreen;
