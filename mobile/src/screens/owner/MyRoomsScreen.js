import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Text, ActivityIndicator, Portal, Modal } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { colors } from "../../theme/colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const MyRoomsScreen = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms/owner/me");
      setRooms(res.data.rooms);
    } catch {
      Alert.alert("Error", "Could not fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [fetchRooms]),
  );

  const handleDelete = async (id) => {
    Alert.alert("Delete Room", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/rooms/${id}`);
            setRooms((prev) => prev.filter((r) => r.id !== id));
            setSelected(null);
          } catch {
            Alert.alert("Error", "Could not delete room");
          }
        },
      },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await api.patch(`/rooms/${id}/toggle-active`);
      // update local state so UI reflects immediately
      setRooms((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, is_active: res.data.room.is_active } : r,
        ),
      );
      setSelected((prev) =>
        prev ? { ...prev, is_active: res.data.room.is_active } : null,
      );
    } catch {
      Alert.alert("Error", "Could not update room status");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={[
            colors.gradientStart,
            colors.gradientMid,
            colors.gradientEnd,
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Text style={styles.title}>My Rooms</Text>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No rooms listed yet</Text>
            <Text style={styles.emptySubtitle}>
              Add a room from the Add Room tab
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelected(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.price}>₹{item.price_per_day}/day</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor: item.is_active
                      ? "rgba(90,158,124,0.15)"
                      : "rgba(217,83,79,0.12)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: item.is_active ? colors.success : colors.error },
                  ]}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Room detail modal */}
      <Portal>
        <Modal
          visible={!!selected}
          onDismiss={() => setSelected(null)}
          contentContainerStyle={styles.modalOverlay}
        >
          {selected && (
            <View style={styles.modal}>
              {/* Modal header */}
              <Text style={styles.modalTitle}>{selected.name}</Text>
              <View style={styles.modalDivider} />

              {/* Detail rows */}
              <View style={styles.modalDetails}>
                <ModalRow label="ADDRESS" value={selected.address} />
                <ModalRow label="CONTACT" value={selected.phone} />
                <ModalRow
                  label="PRICE"
                  value={`₹${selected.price_per_day} / day`}
                  accent
                />
                {selected.description && (
                  <ModalRow label="ABOUT" value={selected.description} />
                )}
                <ModalRow
                  label="COORDINATES"
                  value={`${parseFloat(selected.lat).toFixed(4)}, ${parseFloat(selected.lng).toFixed(4)}`}
                />
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: selected.is_active
                      ? "rgba(217,83,79,0.08)"
                      : "rgba(90,158,124,0.1)",
                    borderColor: selected.is_active
                      ? "rgba(217,83,79,0.3)"
                      : "rgba(90,158,124,0.3)",
                  },
                ]}
                onPress={() => handleToggleActive(selected.id)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    {
                      color: selected.is_active ? colors.error : colors.success,
                    },
                  ]}
                >
                  {selected.is_active ? "Mark as Inactive" : "Mark as Active"}
                </Text>
              </TouchableOpacity>

              {/* Edit button */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  navigation.navigate("Add Room", { room: selected });
                  setSelected(null);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.editBtnText}>Edit Room</Text>
              </TouchableOpacity>

              {/* Delete */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(selected.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.deleteBtnText}>Delete Room</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelected(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const ModalRow = ({ label, value, accent }) => (
  <View style={modalRowStyles.row}>
    <Text style={modalRowStyles.label}>{label}</Text>
    <Text
      style={[
        modalRowStyles.value,
        accent && { color: colors.primary, fontWeight: "700" },
      ]}
    >
      {value}
    </Text>
  </View>
);

const modalRowStyles = StyleSheet.create({
  row: { marginBottom: 12 },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.55)",
    fontWeight: "700",
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "500",
    lineHeight: 20,
  },
});

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: {
    fontWeight: "700",
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
  },

  /* Room card */
  card: {
    backgroundColor: "rgba(255,255,255,0.30)",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  price: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  address: {
    color: "rgba(40,55,70,0.55)",
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* Empty state */
  emptyContainer: {
    alignItems: "center",
    marginTop: 64,
    gap: 8,
  },
  emptyTitle: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "rgba(40,55,70,0.5)",
    fontSize: 13,
    textAlign: "center",
  },

  /* Modal */
  modalOverlay: {
    margin: 24,
  },
  modal: {
    backgroundColor: "rgba(225,233,241,0.97)",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "rgba(74,104,128,0.15)",
    marginBottom: 16,
  },
  modalDetails: {
    marginBottom: 8,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "rgba(217,83,79,0.4)",
    backgroundColor: "rgba(217,83,79,0.08)",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  deleteBtnText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  closeBtn: {
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: "rgba(74,104,128,0.1)",
  },
  closeBtnText: {
    color: "rgba(40,55,70,0.6)",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  toggleBtnText: {
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  editBtn: {
    backgroundColor: "rgba(74,104,128,0.12)",
    borderWidth: 1,
    borderColor: "rgba(74,104,128,0.25)",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 8,
  },
  editBtnText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

export default MyRoomsScreen;
