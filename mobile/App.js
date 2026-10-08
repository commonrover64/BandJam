import "react-native-gesture-handler";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { theme } from "./src/theme";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AuthProvider>
            <PaperProvider theme={theme}>
              <AppNavigator />
            </PaperProvider>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
