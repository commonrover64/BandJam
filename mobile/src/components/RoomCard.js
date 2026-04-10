import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

const RoomCard = ({ room, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleMedium">{room.name}</Text>
        <Text variant="bodySmall" style={styles.address}>
          {room.address}
        </Text>
        <Text variant="bodyMedium">₹{room.price_per_day} / day</Text>
        {/* distance_km comes from PostGIS ST_Distance calculation in backend */}
        {room.distance_km && (
          <Text variant="bodySmall" style={styles.distance}>
            📍 {room.distance_km} km away
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  address: { color: "gray", marginVertical: 4 },
  distance: { color: "#6200ee", marginTop: 4 },
});

export default RoomCard;
