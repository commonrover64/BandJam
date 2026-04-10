import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button, SegmentedButtons } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("consumer");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      await register(name, email, password, role);
      Alert.alert("Success", "Account created! Please login.");
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
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create Account 🎵
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Join as a musician or room owner
      </Text>

      {/* role selector */}
      <SegmentedButtons
        value={role}
        onValueChange={setRole}
        buttons={[
          { value: "consumer", label: "Musician" },
          { value: "owner", label: "Room Owner" },
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Register
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate("Login")}
        style={styles.link}
      >
        Already have an account? Login
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "gray",
    marginBottom: 24,
  },
  segmented: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  link: {
    marginTop: 8,
  },
});

export default RegisterScreen;
