import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../theme/colors";

const OnboardingScreen = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [residentialAddr, setResidentialAddr] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get("/owners/onboard/status");
        if (res.data.is_verified) setIsVerified(true);
      } catch {}
    };
    checkStatus();
  }, []);

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
      setIsVerified(true);
    } catch (err) {
      Alert.alert(
        "Error",
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
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>Owner Onboarding</Text>
        <Text style={styles.subtitle}>
          Complete your profile to start listing rooms
        </Text>

        {/* Step indicator — only show when not verified */}
        {!isVerified && (
          <View style={styles.stepIndicatorRow}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={styles.stepIndicatorItem}>
                <View
                  style={[
                    styles.stepDot,
                    step === s && styles.stepDotActive,
                    step > s && styles.stepDotDone,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepDotText,
                      (step === s || step > s) && styles.stepDotTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </View>
                {s < 3 && (
                  <View
                    style={[styles.stepLine, step > s && styles.stepLineDone]}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Verified state */}
        {isVerified && (
          <View style={styles.card}>
            <View style={styles.verifiedIconCircle}>
              <Text style={styles.verifiedIconText}>✓</Text>
            </View>
            <Text style={styles.verifiedTitle}>You're verified!</Text>
            <Text style={styles.verifiedSub}>
              Your account is fully onboarded and ready to list rooms.
            </Text>
          </View>
        )}

        {/* Step 1 */}
        {!isVerified && step === 1 && (
          <View style={styles.card}>
            <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
            <Text style={styles.stepTitle}>Verify your email</Text>
            <Text style={styles.stepDesc}>
              We'll send a one-time password to your registered email address.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleSendOTP}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "SENDING…" : "SEND OTP"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2 */}
        {!isVerified && step === 2 && (
          <View style={styles.card}>
            <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
            <Text style={styles.stepTitle}>Enter OTP</Text>
            <Text style={styles.stepDesc}>
              Enter the code we sent to your email.
            </Text>
            <Text style={styles.fieldLabel}>OTP CODE</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="6-digit code"
                placeholderTextColor={colors.placeholder}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                style={styles.input}
                theme={inputTheme}
              />
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleVerifyOTP}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "VERIFYING…" : "VERIFY OTP"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkBtn}
              onPress={handleSendOTP}
              activeOpacity={0.7}
            >
              <Text style={styles.linkBtnText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3 */}
        {!isVerified && step === 3 && (
          <View style={styles.card}>
            <Text style={styles.stepLabel}>STEP 3 OF 3</Text>
            <Text style={styles.stepTitle}>Complete your profile</Text>

            <Text style={styles.fieldLabel}>RESIDENTIAL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Your home address"
                placeholderTextColor={colors.placeholder}
                value={residentialAddr}
                onChangeText={setResidentialAddr}
                multiline
                numberOfLines={3}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                style={[
                  styles.input,
                  { minHeight: 80, textAlignVertical: "top" },
                ]}
                theme={inputTheme}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
              PAYMENT DETAILS
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="UPI ID or bank account number"
                placeholderTextColor={colors.placeholder}
                value={paymentDetails}
                onChangeText={setPaymentDetails}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                style={styles.input}
                theme={inputTheme}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleCompleteOnboarding}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "SUBMITTING…" : "COMPLETE ONBOARDING"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 48,
    justifyContent: "center",
  },

  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 26,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    marginBottom: 28,
  },

  /* Step indicator */
  stepIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  stepIndicatorItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    opacity: 0.6,
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(40,55,70,0.5)",
  },
  stepDotTextActive: {
    color: "#fff",
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: colors.primary,
    opacity: 0.6,
  },

  /* Card */
  card: {
    backgroundColor: "rgba(255,255,255,0.30)",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#6a8099",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },

  stepLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.55)",
    fontWeight: "700",
    marginBottom: 8,
  },
  stepTitle: {
    color: colors.textDark,
    fontWeight: "700",
    fontSize: 17,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  stepDesc: {
    color: "rgba(40,55,70,0.55)",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },

  /* Field label */
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.55)",
    fontWeight: "700",
    marginBottom: 6,
  },

  /* Input */
  inputWrapper: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 14,
  },

  /* Primary button */
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#2e4a60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 2.5,
  },

  /* Link button */
  linkBtn: {
    alignItems: "center",
    marginTop: 14,
  },
  linkBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  /* Verified state */
  verifiedIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(90,158,124,0.2)",
    borderWidth: 2,
    borderColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  verifiedIconText: {
    color: colors.success,
    fontSize: 26,
    fontWeight: "700",
  },
  verifiedTitle: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  verifiedSub: {
    color: "rgba(40,55,70,0.55)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default OnboardingScreen;
