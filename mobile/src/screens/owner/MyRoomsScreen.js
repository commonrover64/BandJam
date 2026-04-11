import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  ActivityIndicator,
  Portal,
  Modal,
  Button,
} from "react-native-paper";
import api from "../../services/api";
import { colors } from "../../theme/colors";

const MyRoomsScreen = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // selected room for modal

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

  useEffect(() => {
    fetchRooms();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.lavender} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        My Rooms
      </Text>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No rooms listed yet.</Text>
        }
        renderItem={({ item }) => (
          // simple card — just name, price, status
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelected(item)}
            activeOpacity={0.8}
          >
            <View style={styles.row}>
              <Text variant="titleMedium" style={styles.name}>
                {item.name}
              </Text>
              <Text style={styles.price}>₹{item.price_per_day}/day</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.address}>📍 {item.address}</Text>
              <Text
                style={{
                  color: item.is_active ? colors.green : colors.red,
                  fontSize: 12,
                }}
              >
                {item.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* room detail modal */}
      <Portal>
        <Modal
          visible={!!selected}
          onDismiss={() => setSelected(null)}
          contentContainerStyle={styles.modal}
        >
          {selected && (
            <>
              <Text variant="titleLarge" style={styles.modalTitle}>
                {selected.name}
              </Text>
              <Text style={styles.modalDetail}>📍 {selected.address}</Text>
              <Text style={styles.modalDetail}>📞 {selected.phone}</Text>
              <Text style={styles.modalDetail}>
                💰 ₹{selected.price_per_day} / day
              </Text>
              {selected.description && (
                <Text style={styles.modalDetail}>
                  📝 {selected.description}
                </Text>
              )}
              <Text style={styles.modalDetail}>
                📍 {parseFloat(selected.lat).toFixed(4)},{" "}
                {parseFloat(selected.lng).toFixed(4)}
              </Text>

              <Button
                mode="outlined"
                textColor={colors.red}
                style={[styles.btn, { borderColor: colors.red }]}
                onPress={() => handleDelete(selected.id)}
              >
                Delete Room
              </Button>
              <Button
                mode="text"
                textColor={colors.subtext}
                onPress={() => setSelected(null)}
              >
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.base },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
  },
  title: {
    fontWeight: "bold",
    marginTop: 48,
    marginBottom: 16,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface0,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: { color: colors.text, fontWeight: "bold", flex: 1 },
  price: { color: colors.green, fontWeight: "bold" },
  address: { color: colors.subtext, fontSize: 13, flex: 1 },
  empty: { color: colors.overlay, textAlign: "center", marginTop: 48 },
  modal: {
    backgroundColor: colors.surface0,
    margin: 24,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { color: colors.text, fontWeight: "bold", marginBottom: 16 },
  modalDetail: { color: colors.subtext, marginBottom: 8 },
  btn: { marginTop: 16, marginBottom: 8 },
});

export default MyRoomsScreen;
