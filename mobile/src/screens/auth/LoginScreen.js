import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email))
      newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />

      {/* Full-screen gradient background */}
      <LinearGradient
        colors={["#b8c9d9", "#a0b4c8", "#c5bdb0"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative background icons — faint, like the sample */}
      <View style={styles.bgIcons} pointerEvents="none">
        <Text style={styles.bgIcon}>🎸</Text>
        <Text style={[styles.bgIcon, styles.bgIcon2]}>🥁</Text>
        <Text style={[styles.bgIcon, styles.bgIcon3]}>🎹</Text>
        <Text style={[styles.bgIcon, styles.bgIcon4]}>🎧</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* App badge */}
        <View style={styles.badgeRow}>
          <View style={styles.iconBadge}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.badgeIcon}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.appLabel}>Band Jam</Text>
            <Text style={styles.appTitle}>Welcome back</Text>
          </View>
        </View>

        {/* Frosted card */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#9aabb8"
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
              theme={{
                colors: {
                  primary: "transparent",
                  onSurfaceVariant: "#9aabb8",
                  error: colors.red,
                },
              }}
              error={!!errors.email}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <View style={styles.passwordLabelRow}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#9aabb8"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setErrors((e) => ({ ...e, password: null }));
              }}
              secureTextEntry={!showPassword}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              theme={{
                colors: {
                  primary: "transparent",
                  onSurfaceVariant: "#9aabb8",
                  error: colors.red,
                },
              }}
              error={!!errors.password}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword((prev) => !prev)}
                  color="#9aabb8"
                />
              }
            />
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.signInText}>
              {loading ? "SIGNING IN…" : "SIGN IN"}
            </Text>
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>New here? </Text>
            <Text style={[styles.linkText, styles.linkAccent]}>
              Create an account
            </Text>
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
    overflow: "hidden",
  },
  badgeIcon: {
    width: 60,
    height: 60,
  },
  appLabel: {
    fontSize: 20,
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
    // Shadow for depth
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },

  /* Labels */
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.65)",
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 12,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotText: {
    fontSize: 12,
    color: "rgba(50,65,80,0.5)",
    fontWeight: "500",
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

  /* Sign In button */
  signInBtn: {
    marginTop: 22,
    backgroundColor: "#4a6880",
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

  /* Register link */
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
    color: "#4a6880",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
