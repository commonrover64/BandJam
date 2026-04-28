import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import api from "../../services/api";
import Svg, { Path } from "react-native-svg";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // 1: email+otp, 2: newpassword+confirm, 3: success
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email))
      newErrors.email = "Enter a valid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      setOtpSent(true);
      setErrors({});
    } catch (err) {
      setErrors({
        email: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    setStep(2);
    setErrors({});
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setErrors({
        password: !newPassword ? "Password is required" : undefined,
        confirmPassword: !confirmPassword
          ? "Confirm password is required"
          : undefined,
      });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/reset-password", { email, otp, newPassword });
      setStep(3);
    } catch (err) {
      setErrors({
        password: err.response?.data?.message || "Something went wrong",
      });
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

      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative background icons */}
      <View style={styles.bgIcons} pointerEvents="none">
        <Text style={styles.bgIcon}>🔑</Text>
        <Text style={[styles.bgIcon, styles.bgIcon2]}>🎵</Text>
        <Text style={[styles.bgIcon, styles.bgIcon3]}>🎸</Text>
        <Text style={[styles.bgIcon, styles.bgIcon4]}>🎹</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* App badge */}
        <View style={styles.badgeRow}>
          <View style={styles.iconBadge}>
            <Svg
              width={35}
              height={35}
              viewBox="0 0 16 16"
              fill={colors.primary} // or "#fff" or whatever color matches your theme
            >
              <Path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5" />
              <Path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </Svg>
          </View>
          <View>
            <Text style={styles.appTitle}>Reset password</Text>
          </View>
        </View>

        {/* Frosted card */}
        <View style={styles.card}>
          {step === 1 && (
            <>
              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                REGISTERED EMAIL
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setErrors({});
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: "transparent",
                      onSurfaceVariant: colors.placeholder,
                    },
                  }}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {!otpSent ? (
                <TouchableOpacity
                  style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                  onPress={handleSend}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitText}>
                    {loading ? "SENDING…" : "SEND OTP"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                    OTP
                  </Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      placeholder="6 digit code"
                      placeholderTextColor={colors.placeholder}
                      value={otp}
                      onChangeText={(v) => {
                        setOtp(v);
                        setErrors({});
                      }}
                      keyboardType="number-pad"
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      style={styles.input}
                      theme={{
                        colors: {
                          primary: "transparent",
                          onSurfaceVariant: colors.placeholder,
                        },
                      }}
                    />
                  </View>
                  {errors.otp && (
                    <Text style={styles.errorText}>{errors.otp}</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.submitText}>VERIFY OTP</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setOtpSent(false);
                      setOtp("");
                      setErrors({});
                    }}
                    style={styles.linkRow}
                  >
                    <Text style={styles.linkText}>Wrong email? </Text>
                    <Text style={[styles.linkText, styles.linkAccent]}>
                      Go back
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.hint}>
                Create a new password for{" "}
                <Text style={{ fontWeight: "700" }}>{email}</Text>
              </Text>

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                NEW PASSWORD
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="min 6 characters"
                  placeholderTextColor={colors.placeholder}
                  value={newPassword}
                  onChangeText={(v) => {
                    setNewPassword(v);
                    setErrors({});
                  }}
                  secureTextEntry={!showPassword}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: "transparent",
                      onSurfaceVariant: colors.placeholder,
                    },
                  }}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword((p) => !p)}
                      color={colors.placeholder}
                    />
                  }
                />
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <Text style={[styles.fieldLabel, { marginTop: 12 }]}>
                CONFIRM PASSWORD
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="re-enter password"
                  placeholderTextColor={colors.placeholder}
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    setErrors({});
                  }}
                  secureTextEntry={!showConfirmPassword}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: "transparent",
                      onSurfaceVariant: colors.placeholder,
                    },
                  }}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword((p) => !p)}
                      color={colors.placeholder}
                    />
                  }
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleReset}
                disabled={loading}
                activeOpacity={0.85}
              >
                <Text style={styles.submitText}>
                  {loading ? "RESETTING…" : "RESET PASSWORD"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>
                Password reset successfully!
              </Text>
              <Text style={styles.successHint}>
                You can now login with your new password.
              </Text>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.85}
              >
                <Text style={styles.submitText}>BACK TO LOGIN</Text>
              </TouchableOpacity>
            </View>
          )}
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

  /* Back button */
  backBtn: {
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  backText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 0.3,
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
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: {
    height: 30,
    width: 30,
  },
  appTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
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

  hint: {
    fontSize: 13,
    color: "rgba(40,55,70,0.6)",
    lineHeight: 20,
    marginBottom: 4,
  },

  /* Labels */
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: "rgba(50,65,80,0.65)",
    fontWeight: "700",
    marginBottom: 9,
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

  /* Submit button */
  submitBtn: {
    marginTop: 22,
    padding: 15,
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
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 2.5,
  },

  /* Success state */
  successContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textDark,
    marginBottom: 10,
  },
  successHint: {
    fontSize: 13,
    color: "rgba(40,55,70,0.6)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  successEmail: {
    color: colors.primary,
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  /* Links */
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

export default ForgotPasswordScreen;
