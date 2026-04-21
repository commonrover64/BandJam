// import React from "react";
// import { View, StyleSheet, TouchableOpacity } from "react-native";
// import { Text } from "react-native-paper";
// import { colors } from "../theme/colors";

// const SectionHeader = ({ title, onSeeAll }) => (
//   <View style={styles.row}>
//     <Text variant="titleMedium" style={styles.title}>
//       {title}
//     </Text>
//     {onSeeAll && (
//       <TouchableOpacity onPress={onSeeAll}>
//         <Text style={styles.seeAll}>See all</Text>
//       </TouchableOpacity>
//     )}
//   </View>
// );

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   title: { color: colors.text, fontWeight: "bold", fontSize: 18 },
//   seeAll: { color: colors.lavender, fontSize: 13 },
// });

// export default SectionHeader;

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../theme/colors";

const SectionHeader = ({ title, onSeeAll }) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default SectionHeader;