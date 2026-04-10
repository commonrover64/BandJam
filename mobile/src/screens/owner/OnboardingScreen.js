import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import api from "../../services/api";

const OnboardingScreen = () => {
  const [step, setStep] = useState(1); // step 1: send otp, step 2: verify otp, step 3: details
  const [otp, setOtp] = useState("");
  const [residentialAddr, setResidentialAddr] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await api.post("/owners/send-otp");
      Alert.alert("OTP Sent", "Check your email for the OTP");
      setStep(2);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return Alert.alert("Error", "Please enter the OTP");
    try {
      setLoading(true);
      await api.post("/owners/verify-otp", { otp });
      Alert.alert("Verified!", "Email verified successfully");
      setStep(3);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!residentialAddr || !paymentDetails) {
      return Alert.alert("Error", "Please fill in all fields");
    }
    try {
      setLoading(true);
      await api.post("/owners/onboard", {
        residential_addr: residentialAddr,
        payment_details: paymentDetails,
      });
      Alert.alert("Success", "Onboarding complete! You can now list rooms.");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Owner Onboarding
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Complete your profile to start listing rooms
      </Text>

      {/* step 1 — send otp */}
      {step === 1 && (
        <>
          <Text variant="bodyLarge" style={styles.stepTitle}>
            Step 1: Verify your email
          </Text>
          <Text variant="bodyMedium" style={styles.stepDesc}>
            We'll send an OTP to your registered email address
          </Text>
          <Button
            mode="contained"
            onPress={handleSendOTP}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Send OTP
          </Button>
        </>
      )}

      {/* step 2 — verify otp */}
      {step === 2 && (
        <>
          <Text variant="bodyLarge" style={styles.stepTitle}>
            Step 2: Enter OTP
          </Text>
          <TextInput
            label="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleVerifyOTP}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Verify OTP
          </Button>
          <Button mode="text" onPress={handleSendOTP} style={styles.link}>
            Resend OTP
          </Button>
        </>
      )}

      {/* step 3 — fill details */}
      {step === 3 && (
        <>
          <Text variant="bodyLarge" style={styles.stepTitle}>
            Step 3: Complete your profile
          </Text>
          <TextInput
            label="Residential Address"
            value={residentialAddr}
            onChangeText={setResidentialAddr}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <TextInput
            label="Payment Details (UPI ID or Bank Account)"
            value={paymentDetails}
            onChangeText={setPaymentDetails}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleCompleteOnboarding}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Complete Onboarding
          </Button>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "gray",
    marginBottom: 32,
  },
  stepTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepDesc: {
    color: "gray",
    marginBottom: 24,
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

export default OnboardingScreen;
