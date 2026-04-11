import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
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
    // replace the email regex in both login and register validate()
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
      style={{ flex: 1, backgroundColor: colors.base }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>🎸</Text>
            <Text variant="headlineMedium" style={styles.title}>
              Welcome back
            </Text>
            <Text style={styles.subtitle}>Login to find your space</Text>
          </View>

          {/* form */}
          <View style={styles.form}>
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
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

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
              // eye icon to toggle password visibility
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
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Login
            </Button>

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={[styles.linkText, { color: colors.lavender }]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
    justifyContent: "center",
    padding: 24,
  },
  header: { alignItems: "center", marginBottom: 40 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { color: colors.text, fontWeight: "bold", marginBottom: 4 },
  subtitle: { color: colors.subtext },
  form: { width: "100%" },
  input: { marginBottom: 4, backgroundColor: colors.surface0 },
  errorText: {
    color: colors.red,
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: { marginTop: 16, borderRadius: 10 },
  buttonContent: { paddingVertical: 6 },
  linkRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  linkText: { color: colors.subtext },
});

export default LoginScreen;
