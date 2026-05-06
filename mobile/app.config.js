export default {
  expo: {
    name: "BandJam",
    slug: "mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    splash: {
      image: "./src/assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.Siddhartha.BandJam",
      supportsTablet: true,
    },
    android: {
      package: "com.Siddhartha.BandJam",
      permissions: ["NOTIFICATIONS", "RECEIVE_BOOT_COMPLETED", "VIBRATE"],
      adaptiveIcon: {
        foregroundImage: "./src/assets/logo.png",
        backgroundColor: "#ffffff",
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        },
      },
    },
    plugins: [
      "expo-secure-store",
      "@react-native-community/datetimepicker",
      "expo-location",
      "expo-image-picker",
      [
        "expo-notifications",
        {
          icon: "./src/assets/logo.png",
          color: "#ffffff",
          sounds: [],
        },
      ],
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
    owner: "commonrover",
  },
};