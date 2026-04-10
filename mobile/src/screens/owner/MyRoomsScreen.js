import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Text, Card, Button, ActivityIndicator } from "react-native-paper";
import api from "../../services/api";

const MyRoomsScreen = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms/owner/me");
      setRooms(res.data.rooms);
    } catch (err) {
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
          } catch (err) {
            Alert.alert("Error", "Could not delete room");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        My Rooms
      </Text>
      {rooms.length === 0 ? (
        <Text style={styles.empty}>No rooms listed yet.</Text>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="bodySmall" style={styles.address}>
                  {item.address}
                </Text>
                <Text variant="bodyMedium">₹{item.price_per_day} / day</Text>
                <Text
                  variant="bodySmall"
                  style={{ color: item.is_active ? "green" : "red" }}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleDelete(item.id)} textColor="red">
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#fff" },
  title: { fontWeight: "bold", marginBottom: 16, marginTop: 48 },
  card: { marginBottom: 12 },
  address: { color: "gray", marginVertical: 4 },
  empty: { color: "gray", textAlign: "center", marginTop: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default MyRoomsScreen;
