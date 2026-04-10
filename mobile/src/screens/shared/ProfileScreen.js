import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Avatar } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* avatar with first letter of name */}
      <Avatar.Text
        size={80}
        label={user?.name?.charAt(0).toUpperCase()}
        style={styles.avatar}
      />

      <Text variant="headlineMedium" style={styles.name}>
        {user?.name}
      </Text>
      <Text variant="bodyMedium" style={styles.email}>
        {user?.email}
      </Text>

      {/* role badge */}
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>
          {user?.role === "owner" ? "🎙 Room Owner" : "🎸 Musician"}
        </Text>
      </View>

      <Button
        mode="outlined"
        onPress={handleLogout}
        textColor={colors.red}
        style={styles.logoutBtn}
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
    backgroundColor: colors.base,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { backgroundColor: colors.mauve, marginBottom: 16 },
  name: { color: colors.text, fontWeight: "bold", marginBottom: 4 },
  email: { color: colors.subtext, marginBottom: 16 },
  roleBadge: {
    backgroundColor: colors.surface0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  roleText: { color: colors.lavender, fontWeight: "bold" },
  logoutBtn: { borderColor: colors.red, width: "100%" },
});

export default ProfileScreen;
