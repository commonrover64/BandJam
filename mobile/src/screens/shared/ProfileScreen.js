import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, Avatar, TextInput, Button } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";
import api from "../../services/api";

const INSTRUMENTS = [
  "Guitarist",
  "Bassist",
  "Drummer",
  "Vocalist",
  "Keyboardist",
  "Violinist",
  "Saxophonist",
  "DJ",
  "Producer",
  "Other",
];

const ProfileScreen = () => {
  const { user, logout, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [selectedInstruments, setSelectedInstruments] = useState(
    user?.instruments || [],
  );
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const saveName = async () => {
    try {
      setLoading(true);
      await api.patch("/auth/profile", { name });
      await refreshUser();
      setEditingName(false);
    } catch {
      Alert.alert("Error", "Could not update name");
    } finally {
      setLoading(false);
    }
  };

  const savePhone = async () => {
    try {
      setLoading(true);
      await api.patch("/auth/phone", { phone });
      await refreshUser();
      setEditingPhone(false);
    } catch {
      Alert.alert("Error", "Could not update phone");
    } finally {
      setLoading(false);
    }
  };

  const toggleInstrument = async (instrument) => {
    // toggle selection
    const updated = selectedInstruments.includes(instrument)
      ? selectedInstruments.filter((i) => i !== instrument)
      : [...selectedInstruments, instrument];

    setSelectedInstruments(updated);

    try {
      await api.patch("/auth/instruments", { instruments: updated });
      await refreshUser();
    } catch {
      Alert.alert("Error", "Could not update instruments");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* avatar */}
      <Avatar.Text
        size={80}
        label={user?.name?.charAt(0).toUpperCase()}
        style={styles.avatar}
      />

      {/* role badge */}
      <View style={styles.roleBadge}>
        <Text style={styles.roleText}>
          {user?.role === "owner" ? "🎙 Room Owner" : "🎸 Musician"}
        </Text>
      </View>

      {/* name field */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Name</Text>
        {editingName ? (
          <>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoFocus
            />
            <View style={styles.row}>
              <Button
                onPress={saveName}
                loading={loading}
                textColor={colors.green}
              >
                Save
              </Button>
              <Button
                onPress={() => setEditingName(false)}
                textColor={colors.subtext}
              >
                Cancel
              </Button>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditingName(true)}
          >
            <Text style={styles.fieldValue}>{user?.name}</Text>
            <Text style={styles.editHint}>tap to edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* phone field */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phone</Text>
        {editingPhone ? (
          <>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
              autoFocus
            />
            <View style={styles.row}>
              <Button
                onPress={savePhone}
                loading={loading}
                textColor={colors.green}
              >
                Save
              </Button>
              <Button
                onPress={() => setEditingPhone(false)}
                textColor={colors.subtext}
              >
                Cancel
              </Button>
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={styles.fieldRow}
            onPress={() => setEditingPhone(true)}
          >
            <Text style={styles.fieldValue}>{user?.phone || "Not set"}</Text>
            <Text style={styles.editHint}>tap to edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* email — read only */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldValue}>{user?.email}</Text>
        </View>
      </View>

      {/* instruments — consumer only */}
      {user?.role === "consumer" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>I am a...</Text>
          <View style={styles.instrumentGrid}>
            {INSTRUMENTS.map((inst) => {
              const selected = selectedInstruments.includes(inst);
              return (
                <TouchableOpacity
                  key={inst}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => toggleInstrument(inst)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selected && styles.chipTextSelected,
                    ]}
                  >
                    {inst}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <Button
        mode="outlined"
        onPress={handleLogout}
        textColor={colors.red}
        style={styles.logoutBtn}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.base,
    alignItems: "center",
  },
  avatar: { backgroundColor: colors.mauve, marginTop: 48, marginBottom: 12 },
  roleBadge: {
    backgroundColor: colors.surface0,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  roleText: { color: colors.lavender, fontWeight: "bold" },
  section: {
    width: "100%",
    backgroundColor: colors.surface0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { color: colors.subtext, fontSize: 12, marginBottom: 8 },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldValue: { color: colors.text, fontSize: 16 },
  editHint: { color: colors.overlay, fontSize: 12 },
  input: { backgroundColor: colors.surface1, marginBottom: 8 },
  row: { flexDirection: "row" },
  instrumentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.surface2,
  },
  chipSelected: { backgroundColor: colors.mauve, borderColor: colors.mauve },
  chipText: { color: colors.subtext, fontSize: 13 },
  chipTextSelected: { color: colors.base, fontWeight: "bold" },
  logoutBtn: {
    borderColor: colors.red,
    width: "100%",
    marginTop: 12,
    marginBottom: 32,
  },
});

export default ProfileScreen;
