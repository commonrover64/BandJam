import { MD3DarkTheme } from "react-native-paper";
import { colors } from "./colors";

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.lavender,
    secondary: colors.mauve,
    background: colors.base,
    surface: colors.surface0,
    surfaceVariant: colors.surface1,
    onBackground: colors.text,
    onSurface: colors.text,
    outline: colors.surface2,
    error: colors.red,
  },
};
