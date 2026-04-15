import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { PaperProvider } from "react-native-paper";
import { theme } from "./src/theme";

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
