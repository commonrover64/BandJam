import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { colors } from "../theme/colors";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={colors.lavender} />
    <Text style={styles.text}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.base,
    gap: 12,
  },
  text: { color: colors.subtext, fontSize: 14 },
});

export default LoadingSpinner;
