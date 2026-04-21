import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("consumer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email))
      newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await register(name, email, password, role);
      Alert.alert("Account created!", "Please login to continue.");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert(
        "Register Failed",
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative background icons */}
      <View style={styles.bgIcons} pointerEvents="none">
        <Text style={styles.bgIcon}>🎵</Text>
        <Text style={[styles.bgIcon, styles.bgIcon2]}>🎙</Text>
        <Text style={[styles.bgIcon, styles.bgIcon3]}>🎸</Text>
        <Text style={[styles.bgIcon, styles.bgIcon4]}>🎹</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* App badge */}
        <View style={styles.badgeRow}>
          <View style={styles.iconBadge}>
            <Text style={styles.badgeEmoji}>🎵</Text>
          </View>
          <View>
            <Text style={styles.appLabel}>MY APP</Text>
            <Text style={styles.appTitle}>Create account</Text>
          </View>
        </View>

        {/* Frosted card */}
        <View style={styles.card}>
          {/* Role toggle */}
          <Text style={styles.fieldLabel}>I AM A</Text>
          <View style={styles.roleToggle}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === "consumer" && styles.roleBtnActive,
              ]}
              onPress={() => setRole("consumer")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  role === "consumer" && styles.roleBtnTextActive,
                ]}
              >
                🎸 Musician
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, role === "owner" && styles.roleBtnActive]}
              onPress={() => setRole("owner")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  role === "owner" && styles.roleBtnTextActive,
                ]}
              >
                🎙 Room Owner
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>FULL NAME</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Your name"
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

          {/* Email */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>EMAIL</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErrors((e) => ({ ...e, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              theme={inputTheme}
              error={!!errors.email}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <Text style={[styles.fieldLabel, { marginTop: 12 }]}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrors((e) => ({ ...e, password: null }));
              }}
              secureTextEntry={!showPassword}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              theme={inputTheme}
              error={!!errors.password}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword((prev) => !prev)}
                  color={colors.placeholder}
                />
              }
            />
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.signInText}>
              {loading ? "CREATING…" : "CREATE ACCOUNT"}
            </Text>
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>Already have an account? </Text>
            <Text style={[styles.linkText, styles.linkAccent]}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  /* Background decorative icons */
  bgIcons: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgIcon: {
    position: "absolute",
    fontSize: 64,
    opacity: 0.08,
    top: 80,
    left: 20,
    transform: [{ rotate: "-15deg" }],
  },
  bgIcon2: {
    top: 140,
    left: "55%",
    fontSize: 52,
    transform: [{ rotate: "10deg" }],
  },
  bgIcon3: {
    top: 220,
    left: "30%",
    fontSize: 44,
    transform: [{ rotate: "-8deg" }],
  },
  bgIcon4: {
    top: 70,
    right: 30,
    left: undefined,
    fontSize: 56,
    transform: [{ rotate: "5deg" }],
  },

  /* App badge row */
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
    paddingLeft: 4,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(74, 104, 128, 0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: { fontSize: 24 },
  appLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  /* Frosted card */
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.30)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },

  /* Role toggle */
  roleToggle: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  roleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(40,55,70,0.7)",
  },
  roleBtnTextActive: {
    color: "#fff",
  },

  /* Labels */
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.65)",
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 4,
  },

  /* Input */
  inputWrapper: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 2,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 15,
  },

  errorText: {
    color: "#d9534f",
    fontSize: 11,
    marginBottom: 4,
    marginLeft: 4,
  },

  /* Create Account button */
  signInBtn: {
    marginTop: 22,
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
  signInText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 2.5,
  },

  /* Login link */
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  linkText: {
    color: "rgba(40,55,70,0.6)",
    fontSize: 13,
  },
  linkAccent: {
    color: colors.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
