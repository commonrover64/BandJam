import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
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

  const inputTheme = {
    colors: {
      primary: "transparent",
      onSurfaceVariant: colors.placeholder,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Name + role badge */}
        <Text style={styles.displayName}>{user?.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === "owner" ? "Room Owner" : "Musician"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Name field */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>NAME</Text>
          {editingName ? (
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  style={styles.input}
                  theme={inputTheme}
                />
              </View>
              <View style={styles.editBtnRow}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={saveName}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveBtnText}>
                    {loading ? "Saving…" : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditingName(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
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

        {/* Phone field */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PHONE</Text>
          {editingPhone ? (
            <>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoFocus
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  style={styles.input}
                  theme={inputTheme}
                />
              </View>
              <View style={styles.editBtnRow}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={savePhone}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveBtnText}>
                    {loading ? "Saving…" : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditingPhone(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
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

        {/* Email — read only */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldValue}>{user?.email}</Text>
          </View>
        </View>

        {/* Instruments — consumer only */}
        {user?.role === "consumer" && (
          <View style={styles.card}>
            <Text style={styles.fieldLabel}>I AM A</Text>
            <View style={styles.instrumentGrid}>
              {INSTRUMENTS.map((inst) => {
                const selected = selectedInstruments.includes(inst);
                return (
                  <TouchableOpacity
                    key={inst}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleInstrument(inst)}
                    activeOpacity={0.8}
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

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
  },

  /* Avatar */
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(74,104,128,0.75)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 56,
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },

  displayName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginBottom: 8,
  },

  /* Role badge */
  roleBadge: {
    backgroundColor: "rgba(74,104,128,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 28,
  },
  roleText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* Card */
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.6)",
    fontWeight: "700",
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldValue: {
    color: colors.textDark,
    fontSize: 15,
    fontWeight: "500",
  },
  editHint: {
    color: colors.placeholder,
    fontSize: 12,
  },

  /* Inline edit inputs */
  inputWrapper: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 15,
  },
  editBtnRow: {
    flexDirection: "row",
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  cancelBtnText: {
    color: colors.textDark,
    fontWeight: "600",
    fontSize: 13,
  },

  /* Instruments */
  instrumentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: "rgba(40,55,70,0.7)",
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },

  /* Logout */
  logoutBtn: {
    width: "100%",
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(217,83,79,0.4)",
    backgroundColor: "rgba(217,83,79,0.08)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;
