import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { colors } from "./colors";

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary, // navy — buttons, active states
    secondary: colors.placeholder, // muted blue-gray
    background: colors.gradientStart, // fallback bg (gradient overrides this in screens)
    surface: colors.inputBg, // card/input surfaces
    surfaceVariant: colors.glass, // elevated variants
    onBackground: colors.text,
    onSurface: colors.textDark,
    onSurfaceVariant: colors.placeholder, // label/placeholder color inside TextInput
    outline: colors.cardBorder,
    error: colors.error,
  },
};
