import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

const DashboardScreen = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Hey, {user?.name} 👋
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Manage your practice spaces from here
      </Text>
      <Button
        mode="outlined"
        onPress={logout}
        style={styles.logout}
        textColor="red"
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: { fontWeight: "bold", marginBottom: 8 },
  subtitle: { color: "gray", marginBottom: 32 },
  logout: { borderColor: "red" },
});

export default DashboardScreen;
