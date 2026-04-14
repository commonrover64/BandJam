import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../theme/colors";

const PaginationBar = ({ page, totalPages, onPrev, onNext }) => {
  if (totalPages <= 1) return null;
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, page === 1 && styles.disabled]}
        onPress={onPrev}
        disabled={page === 1}
      >
        <Text style={styles.btnText}>← Prev</Text>
      </TouchableOpacity>

      <Text style={styles.pageText}>
        {page} / {totalPages}
      </Text>

      <TouchableOpacity
        style={[styles.btn, page === totalPages && styles.disabled]}
        onPress={onNext}
        disabled={page === totalPages}
      >
        <Text style={styles.btnText}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  btn: {
    backgroundColor: colors.surface0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabled: { opacity: 0.3 },
  btnText: { color: colors.lavender, fontWeight: "bold" },
  pageText: { color: colors.subtext },
});

export default PaginationBar;
