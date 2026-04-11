import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput, Button, SegmentedButtons } from "react-native-paper";
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.base }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎵</Text>
          <Text variant="headlineMedium" style={styles.title}>
            Create account
          </Text>
          <Text style={styles.subtitle}>Join as a musician or room owner</Text>
        </View>

        {/* role toggle */}
        <SegmentedButtons
          value={role}
          onValueChange={setRole}
          buttons={[
            { value: "consumer", label: "🎸 Musician" },
            { value: "owner", label: "🎙 Room Owner" },
          ]}
          style={styles.segmented}
          theme={{
            colors: {
              secondaryContainer: colors.mauve,
              onSecondaryContainer: colors.base,
              outline: colors.surface2,
            },
          }}
        />

        {/* form */}
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors((e) => ({ ...e, name: null }));
          }}
          theme={{
            colors: {
              primary: colors.lavender, // active border color
              onSurfaceVariant: colors.subtext, // label color
              error: colors.red,
            },
          }}
          error={!!errors.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErrors((e) => ({ ...e, email: null }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          theme={{
            colors: {
              primary: colors.lavender, // active border color
              onSurfaceVariant: colors.subtext, // label color
              error: colors.red,
            },
          }}
          error={!!errors.email}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setErrors((e) => ({ ...e, password: null }));
          }}
          secureTextEntry={!showPassword}
          theme={{
            colors: {
              primary: colors.lavender, // active border color
              onSurfaceVariant: colors.subtext, // label color
              error: colors.red,
            },
          }}
          error={!!errors.password}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword((prev) => !prev)}
              color={colors.overlay}
            />
          }
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Create Account
        </Button>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.linkRow}
        >
          <Text style={styles.linkText}>Already have an account? </Text>
          <Text style={[styles.linkText, { color: colors.lavender }]}>
            Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.base,
    justifyContent: "center",
    padding: 24,
  },
  header: { alignItems: "center", marginBottom: 32 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { color: colors.text, fontWeight: "bold", marginBottom: 4 },
  subtitle: { color: colors.subtext },
  segmented: { marginBottom: 24 },
  input: { marginBottom: 4, backgroundColor: colors.surface0 },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: { marginTop: 16, borderRadius: 10 },
  buttonContent: { paddingVertical: 6 },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  linkText: { color: colors.subtext },
});

export default RegisterScreen;
