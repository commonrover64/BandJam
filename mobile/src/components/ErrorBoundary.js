import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

// Catches render errors so a bug in one screen shows a recovery screen
// instead of killing the whole app in a release build.
export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // hook Sentry / Crashlytics here later
    console.error("Unhandled render error:", error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          {String(this.state.error?.message || this.state.error)}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={this.reset}>
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.gradientStart,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.textDark, marginBottom: 8 },
  message: { fontSize: 13, color: colors.subtext, textAlign: "center", marginBottom: 20 },
  btn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: colors.white, fontWeight: "700" },
});
